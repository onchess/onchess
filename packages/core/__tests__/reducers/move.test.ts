import { Chess } from "chess.js";
import { zeroAddress } from "viem";
import { describe, test } from "vitest";
import { createPlayer } from "../../src/players.js";
import move from "../../src/reducers/move.js";
import type { Config, State } from "../../src/state.js";
import { formatToPGNDate } from "../../src/util.js";

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

describe("move", () => {
    test("should move a piece", () => {
        const alice = createPlayer(
            "0x0000000000000000000000000000000000000001",
        );
        const bob = createPlayer("0x0000000000000000000000000000000000000002");
        const game = "0x0000000000000000000000000000000000000003";
        const metadata = {
            appContract: zeroAddress,
            blockNumber: 1n,
            blockTimestamp: 1748055599n,
            chainId: 13370n,
            index: 1n,
            msgSender: alice.address,
            prevRandao: 0n,
        };

        const chess = new Chess();
        chess.setHeader("White", alice.address);
        chess.setHeader("Black", bob.address);
        chess.setHeader("Event", "Casual Game");
        chess.setHeader("Site", "OnChess.xyz");
        chess.setHeader(
            "Date",
            formatToPGNDate(Number(metadata.blockTimestamp) * 1000),
        );
        const pgn = chess.pgn();
        console.log(pgn);

        const state: State = {
            games: {
                [game]: {
                    address: game,
                    white: alice.address,
                    black: bob.address,
                    pot: "1",
                    pgn,
                    timeControl: "1+0",
                    updatedAt: 0,
                    whiteTime: 100,
                    blackTime: 100,
                    result: undefined,
                },
            },
            players: {
                [alice.address]: alice,
                [bob.address]: bob,
            },
            isShutdown: false,
            lobby: {},
            rake: "0",
            vouchers: [],
            config,
        };

        move(state, {
            type: "move",
            payload: {
                metadata,
                address: game,
                move: "e4",
            },
        });
    });
});
