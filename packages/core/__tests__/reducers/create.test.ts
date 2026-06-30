import {
    concat,
    getAddress,
    keccak256,
    numberToHex,
    slice,
    zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { createPlayer } from "../../src/players.js";
import create from "../../src/reducers/create.js";
import type { Config, State } from "../../src/state.js";

const config: Config = {
    eloKFactor: 20,
    rakeDivider: 20,
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // anvil default account 2
    token: {
        address: "0xFBdB734EF6a23aD76863CbA6f10d0C5CBBD8342C", // TestToken
        decimals: 18,
        name: "Test",
        symbol: "TEST",
    },
};

describe("create", () => {
    it("should not work if application is shutdown", () => {
        const state: State = {
            config,
            games: {},
            isShutdown: true,
            lobby: {},
            players: {},
            rake: "",
            vouchers: [],
        };

        const alice = createPlayer(
            "0x0000000000000000000000000000000000000001",
        );

        const metadata = {
            appContract: zeroAddress,
            blockNumber: 1n,
            blockTimestamp: 1748055599n,
            chainId: 31337n,
            index: 1n,
            msgSender: alice.address,
            prevRandao: 0n,
        };

        const payload = {
            bet: "100000",
            timeControl: "1500",
            minRating: 800,
            maxRating: 1200,
            metadata,
        };

        create(state, {
            type: "create",
            payload,
        });

        expect(Object.keys(state.lobby).length).toBe(0);
        expect(state.players[alice.address].message).toBeDefined();
        expect(state.players[alice.address].message?.type).toBe("error");
        expect(state.players[alice.address].message?.text).toBe(
            "Application is shutdown",
        );
    });

    it("should not work if player has not enough funds", () => {
        const state: State = {
            config,
            games: {},
            isShutdown: false,
            lobby: {},
            players: {},
            rake: "",
            vouchers: [],
        };

        const alice = createPlayer(
            "0x0000000000000000000000000000000000000001",
        );

        const metadata = {
            appContract: zeroAddress,
            blockNumber: 1n,
            blockTimestamp: 1748055599n,
            chainId: 31337n,
            index: 1n,
            msgSender: alice.address,
            prevRandao: 0n,
        };

        create(state, {
            type: "create",
            payload: {
                bet: "100000",
                timeControl: "1500",
                minRating: 800,
                maxRating: 1200,
                metadata,
            },
        });

        expect(Object.keys(state.lobby).length).toBe(0);
        expect(state.players[alice.address].message).toBeDefined();
        expect(state.players[alice.address].message?.type).toBe("error");
        expect(state.players[alice.address].message?.text).toBe(
            "Not enough funds",
        );
    });

    it("should not work with invalid time control", () => {
        const state: State = {
            config,
            games: {},
            isShutdown: false,
            lobby: {},
            players: {},
            rake: "",
            vouchers: [],
        };

        const alice = createPlayer(
            "0x0000000000000000000000000000000000000001",
        );
        alice.balance = "1000000";

        const metadata = {
            appContract: zeroAddress,
            blockNumber: 1n,
            blockTimestamp: 1748055599n,
            chainId: 31337n,
            index: 1n,
            msgSender: alice.address,
            prevRandao: 0n,
        };

        const payload = {
            bet: "100000",
            timeControl: "invalid",
            minRating: 800,
            maxRating: 1200,
            metadata,
        };

        create(state, { type: "create", payload });

        expect(Object.keys(state.lobby).length).toBe(0);
        expect(state.players[alice.address].message).toBeDefined();
        expect(state.players[alice.address].message?.type).toBe("error");
        expect(state.players[alice.address].message?.text).toBe(
            "Invalid time control: invalid",
        );
    });

    it("should create a game in lobby", () => {
        const alice = createPlayer(
            "0x0000000000000000000000000000000000000001",
        );
        alice.balance = "1000000";

        const state: State = {
            config,
            games: {},
            isShutdown: false,
            lobby: {},
            players: {
                [alice.address]: alice,
            },
            rake: "",
            vouchers: [],
        };

        const metadata = {
            appContract: zeroAddress,
            blockNumber: 1n,
            blockTimestamp: 1748055599n,
            chainId: 31337n,
            index: 1n,
            msgSender: alice.address,
            prevRandao: 0n,
        };

        const payload = {
            bet: "100000",
            timeControl: "1500",
            minRating: 800,
            maxRating: 1200,
            metadata,
        };
        create(state, {
            type: "create",
            payload,
        });

        const address = getAddress(
            slice(
                keccak256(
                    concat([numberToHex(metadata.index), metadata.msgSender]),
                ),
                0,
                20,
            ),
        );
        expect(Object.keys(state.lobby).length).toBe(1);
        const lobby = Object.values(state.lobby)[0];
        expect(lobby.address).toBe(address);
        expect(lobby.bet).toBe(payload.bet);
        expect(lobby.timeControl).toBe(payload.timeControl);
        expect(lobby.minRating).toBe(payload.minRating);
        expect(lobby.maxRating).toBe(payload.maxRating);
        expect(lobby.player).toBe(alice.address);
    });
});
