// OnChess payload decoder for the Cartesi Node Explorer, written against the
// @deroll/decoder kit.
//
// Load it directly from GitHub in the explorer's decoder registration UI:
//
//   gh:onchess/onchess@main/packages/decoder/src/index.ts
//
// The explorer transpiles this TypeScript on the fly via esm.sh and supplies
// `@deroll/decoder` through an import map, so nothing needs to be published.
//
// Dispatch mirrors the backend (packages/core/src/app.ts):
//   • ERC-20 deposits arrive through the Cartesi ERC20Portal and are the same
//     for every app, so they go through the kit's shared decodePortalInput().
//   • Every other input is an ABI-encoded call to one of the game functions
//     (create, join, move, ...), decoded with viem against the same ABI.
//   • Outputs are vouchers: winners are paid out via ERC-20 transfer() (and the
//     owner-only upgrade uses approve()), so a voucher to the settlement token
//     is decoded against the standard ERC-20 ABI.

import {
    type DecodeResult,
    type Decoder,
    type OutputContext,
    decodePortalInput,
    shortHex,
} from "@deroll/decoder";
import {
    type Hex,
    decodeFunctionData,
    erc20Abi,
    formatUnits,
    isHex,
} from "viem";
// The onchain API, shared with the backend/frontend rather than duplicated.
// `@onchess/core` is not published, so the build bundles the ABI in — via the
// `@onchess/core/abi` subpath, a viem-only module, so none of core's node-only
// code (deroll, Redux Toolkit, chess.js) is pulled into the browser bundle.
// Only viem and @deroll/decoder stay external for the CDN to resolve.
import { ABI } from "@onchess/core/abi";

export const version = 1;
export const name = "OnChess";

// The ERC-20 token each chain settles in (lowercase address), from
// apps/backend/src/config.ts. Used to render token amounts and to recognize
// payout vouchers.
interface Token {
    symbol: string;
    decimals: number;
    address: string;
}

const TOKENS: Record<number, Token> = {
    8453: {
        symbol: "USDC",
        decimals: 6,
        address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    },
    84532: {
        symbol: "USDC",
        decimals: 6,
        address: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
    },
    13370: {
        symbol: "FUN",
        decimals: 18,
        address: "0x88a2120b7068e78692c8fd12e751d610b6377e4d",
    },
};

const tokenForChain = (chainId?: number): Token | undefined =>
    chainId !== undefined ? TOKENS[chainId] : undefined;

const tokenForAddress = (address: string): Token | undefined => {
    const addr = address.toLowerCase();
    return Object.values(TOKENS).find((t) => t.address === addr);
};

/** Format a raw token amount; falls back to the raw value on an unknown chain. */
const formatAmount = (value: bigint, token?: Token): string =>
    token
        ? `${formatUnits(value, token.decimals)} ${token.symbol}`
        : value.toString();

function decodeGameInput(
    payload: string,
    chainId?: number,
): DecodeResult | null {
    if (!isHex(payload)) return null;
    let call: ReturnType<typeof decodeFunctionData<typeof ABI>>;
    try {
        call = decodeFunctionData({ abi: ABI, data: payload as Hex });
    } catch {
        return null; // not one of the game functions
    }

    const token = tokenForChain(chainId);
    switch (call.functionName) {
        case "create": {
            const [bet, timeControl, minRating, maxRating] = call.args;
            return {
                summary: `Create game · ${formatAmount(bet, token)} · ${timeControl} · rating ${minRating}–${maxRating}`,
                data: {
                    type: "create",
                    bet: bet.toString(),
                    timeControl,
                    minRating,
                    maxRating,
                },
            };
        }
        case "join": {
            const [challenge] = call.args;
            return {
                summary: `Join challenge ${shortHex(challenge)}`,
                data: { type: "join", challenge },
            };
        }
        case "cancel": {
            const [challenge] = call.args;
            return {
                summary: `Cancel challenge ${shortHex(challenge)}`,
                data: { type: "cancel", challenge },
            };
        }
        case "move": {
            const [game, move] = call.args;
            return {
                summary: `Move ${move} · game ${shortHex(game)}`,
                data: { type: "move", game, move },
            };
        }
        case "resign": {
            const [game] = call.args;
            return {
                summary: `Resign · game ${shortHex(game)}`,
                data: { type: "resign", game },
            };
        }
        case "claim": {
            const [game] = call.args;
            return {
                summary: `Claim victory · game ${shortHex(game)}`,
                data: { type: "claim", game },
            };
        }
        case "withdraw": {
            const [value] = call.args;
            return {
                summary: `Withdraw ${formatAmount(value, token)}`,
                data: { type: "withdraw", amount: value.toString() },
            };
        }
        case "withdrawRake":
            return { summary: "Withdraw rake", data: { type: "withdrawRake" } };
        case "setRakeDivider": {
            const [rake] = call.args;
            return {
                summary: `Set rake divider ${rake}`,
                data: { type: "setRakeDivider", rake },
            };
        }
        case "shutdown":
            return { summary: "Shutdown", data: { type: "shutdown" } };
        case "transferOwnership": {
            const [newOwner] = call.args;
            return {
                summary: `Transfer ownership → ${shortHex(newOwner)}`,
                data: { type: "transferOwnership", newOwner },
            };
        }
        case "upgrade": {
            const [dapp] = call.args;
            return {
                summary: `Upgrade → ${shortHex(dapp)}`,
                data: { type: "upgrade", dapp },
            };
        }
        default:
            return null;
    }
}

function decodeVoucher(
    payload: string,
    context: OutputContext,
): DecodeResult | null {
    const destination = context.record?.decoded_data?.destination;
    if (!destination) return null; // notices carry no destination
    const token = tokenForAddress(destination);
    if (!token) return null; // destination is not the settlement token
    if (!isHex(payload)) return null;

    let call: ReturnType<typeof decodeFunctionData<typeof erc20Abi>>;
    try {
        call = decodeFunctionData({ abi: erc20Abi, data: payload as Hex });
    } catch {
        return null;
    }

    switch (call.functionName) {
        case "transfer": {
            const [to, value] = call.args;
            return {
                summary: `Payout · ${formatAmount(value, token)} → ${shortHex(to)}`,
                data: {
                    type: "voucher",
                    method: "transfer",
                    token: token.symbol,
                    to,
                    amount: value.toString(),
                },
            };
        }
        case "approve": {
            const [spender, value] = call.args;
            return {
                summary: `Approve · ${formatAmount(value, token)} · spender ${shortHex(spender)}`,
                data: {
                    type: "voucher",
                    method: "approve",
                    token: token.symbol,
                    spender,
                    amount: value.toString(),
                },
            };
        }
        default:
            return null;
    }
}

export const decode: Decoder["decode"] = (payload, context) => {
    if (context.kind === "output") return decodeVoucher(payload, context);
    if (context.kind !== "input") return null; // reports

    // deposits from a known portal sender — shared across every app
    const deposit = decodePortalInput(payload, context);
    if (deposit) return deposit;

    // the application's own game messages
    return decodeGameInput(payload, context.chainId);
};
