import { Token } from "@onchess/core";
import { Address } from "viem";

export const owner: Address =
    (process.env.NEXT_PUBLIC_OWNER_ADDRESS as Address) ||
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export const dapp: Address =
    (process.env.NEXT_PUBLIC_DAPP_ADDRESS as Address) ||
    "0xab7528bb862fB57E8A2BCd567a2e929a0Be56a5e";

const tokens: Record<Address, Token> = {
    "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2": {
        address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
        decimals: 18,
        name: "Test",
        symbol: "TEST",
    },
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        name: "USD Coin",
        symbol: "USDC",
    },
};

export const token: Token =
    tokens[
        (process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address) ||
            "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2"
    ];
