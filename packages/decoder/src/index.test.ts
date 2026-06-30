// The decoder's ABI comes from @onchess/core (no duplication) and its tokens
// mirror apps/backend/src/config.ts. This test exercises the decode/summary
// logic against the real @deroll/decoder kit.

import { encodeFunctionData, erc20Abi } from "viem";
import { describe, expect, it } from "vitest";
import { ABI } from "@onchess/core/abi";
import { decode, name, version } from "./index.ts";

const inCtx = (chainId?: number) => ({
    kind: "input" as const,
    application: "0x",
    chainId,
});
const outCtx = (destination: string, chainId?: number) =>
    ({
        kind: "output" as const,
        application: "0x",
        chainId,
        record: { decoded_data: { destination } },
        // biome-ignore lint/suspicious/noExplicitAny: minimal Output stub for the test
    }) as any;

describe("onchess decoder", () => {
    it("exports the decoder contract", () => {
        expect(version).toBe(1);
        expect(name).toBe("OnChess");
    });

    it("create — formats bet with the chain's token", async () => {
        const p = encodeFunctionData({
            abi: ABI,
            functionName: "create",
            args: [1000000n, "1500", 800, 1200],
        });
        const r = await decode(p, inCtx(84532));
        expect(r?.summary).toBe(
            "Create game · 1 USDC · 1500 · rating 800–1200",
        );
        // data must be JSON-serializable (bigint bet rendered as a string)
        expect(() => JSON.stringify(r?.data)).not.toThrow();
        // biome-ignore lint/suspicious/noExplicitAny: structural check
        expect((r?.data as any).bet).toBe("1000000");
    });

    it("move", async () => {
        const p = encodeFunctionData({
            abi: ABI,
            functionName: "move",
            args: ["0x0000000000000000000000000000000000000003", "e4"],
        });
        expect((await decode(p, inCtx(84532)))?.summary).toContain("Move e4");
    });

    it("withdraw — raw amount on an unknown chain", async () => {
        const p = encodeFunctionData({
            abi: ABI,
            functionName: "withdraw",
            args: [5000000n],
        });
        expect((await decode(p, inCtx()))?.summary).toBe("Withdraw 5000000");
    });

    it("payout voucher — erc-20 transfer to the settlement token", async () => {
        const p = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: ["0x1234567890123456789012345678901234567890", 2500000n],
        });
        const r = await decode(
            p,
            outCtx("0x036cbd53842c5426634e7929541ec2318f3dcf7e", 84532),
        );
        expect(r?.summary).toContain("Payout · 2.5 USDC → 0x");
    });

    it("returns null for an unrecognized input", async () => {
        expect(await decode("0xdeadbeef", inCtx(84532))).toBeNull();
    });
});
