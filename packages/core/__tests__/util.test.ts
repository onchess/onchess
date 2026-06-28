import { describe, expect, it } from "vitest";
import { bigIntReplacer } from "../src/util.js";

describe("bigIntReplacer", () => {
    it("plain JSON.stringify throws on a bigint; with the replacer it does not", () => {
        expect(() => JSON.stringify(1n)).toThrow();
        expect(JSON.stringify(1n, bigIntReplacer)).toBe('"1"');
    });

    it("serializes the bigint deroll metadata carried by every processed action", () => {
        // deroll v2 AdvanceRequestMetadata fields are bigints, and the action
        // payload carries the whole metadata object — so app.ts's
        // JSON.stringify(processedAction) throws without the replacer.
        const action = {
            type: "chess/move",
            payload: {
                metadata: {
                    chainId: 8453n,
                    appContract: "0x0000000000000000000000000000000000000001",
                    msgSender: "0x0000000000000000000000000000000000000002",
                    blockNumber: 21000000n,
                    blockTimestamp: 1700000000n,
                    prevRandao: 99999999999999999999n,
                    index: 0n,
                },
                address: "0x0000000000000000000000000000000000000003",
                move: "e4",
            },
        };

        expect(() => JSON.stringify(action)).toThrow();

        const parsed = JSON.parse(JSON.stringify(action, bigIntReplacer));
        expect(parsed.payload.metadata.chainId).toBe("8453");
        expect(parsed.payload.metadata.blockTimestamp).toBe("1700000000");
        // large bigints keep full precision as strings (a number would be lossy)
        expect(parsed.payload.metadata.prevRandao).toBe("99999999999999999999");
        expect(parsed.payload.metadata.index).toBe("0");
        expect(parsed.payload.move).toBe("e4");
    });

    it("leaves State's decimal-string money fields untouched", () => {
        const state = { rake: "12", players: { a: { balance: "500" } } };
        expect(JSON.parse(JSON.stringify(state, bigIntReplacer))).toEqual(
            state,
        );
    });
});
