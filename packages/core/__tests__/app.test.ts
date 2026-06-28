import type { AdvanceRequestData, App } from "@deroll/core";
import {
    type Hex,
    encodeFunctionData,
    getAddress,
    hexToString,
    toBytes,
} from "viem";
import { describe, expect, it } from "vitest";
import { ABI, type Config, type State, createChess } from "../src/index.js";

const config: Config = {
    eloKFactor: 20,
    rakeDivider: 20,
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    token: {
        address: "0xFBdB734EF6a23aD76863CbA6f10d0C5CBBD8342C",
        decimals: 18,
        name: "Test",
        symbol: "TEST",
    },
};

const initialState = (): State => ({
    config,
    games: {},
    isShutdown: false,
    lobby: {},
    players: {},
    rake: "0",
    vouchers: [],
});

describe("createChess advance handler", () => {
    it("decodes a create input delivered as a deroll v2 Buffer payload", async () => {
        // capture the advance handler createChess registers and the notices it emits
        let handler:
            | ((data: AdvanceRequestData) => Promise<string>)
            | undefined;
        const notices: { payload: Hex }[] = [];
        const app = {
            addAdvanceHandler: (h: typeof handler) => {
                handler = h;
            },
            createNotice: async (notice: { payload: Hex }) => {
                notices.push(notice);
                return 0;
            },
            createVoucher: async () => 0,
        } as unknown as App;

        createChess(app, initialState());
        expect(handler).toBeDefined();

        // the frontend encodes create(...) as a hex string; deroll v2 delivers
        // the input to the machine as a Buffer
        const hex = encodeFunctionData({
            abi: ABI,
            functionName: "create",
            args: [0n, "1500", 0, 4000],
        });
        const payload = Buffer.from(toBytes(hex));

        const metadata = {
            chainId: 31337n,
            appContract: "0x0000000000000000000000000000000000000001",
            msgSender: "0x0000000000000000000000000000000000000002",
            blockNumber: 1n,
            blockTimestamp: 1700000000n,
            prevRandao: 0n,
            index: 0n,
        } as const;

        // before the Buffer->hex fix this rejected with
        // "Encoded function signature ... not found on ABI"
        const result = await handler?.({ metadata, payload });
        expect(result).toBe("accept");

        // the first notice carries the new state; it should hold the created game
        const state = JSON.parse(hexToString(notices[0].payload))
            .chess as State;
        expect(Object.keys(state.lobby)).toHaveLength(1);
        const challenge = Object.values(state.lobby)[0];
        expect(challenge.player).toBe(getAddress(metadata.msgSender));
        expect(challenge.timeControl).toBe("1500");
    });
});
