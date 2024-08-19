import { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { getAddress } from "viem";
import { concat, keccak256, numberToHex, slice } from "viem/utils";
import { createError } from "../message.js";
import { LobbyBasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { Game, State } from "../state.js";
import { startTime } from "../time.js";
import { hexToFraction } from "../util.js";

export default (state: State, action: PayloadAction<LobbyBasePayload>) => {
    // join game
    const { address, metadata } = action.payload;
    const { input_index, timestamp } = metadata;
    const msg_sender = getAddress(metadata.msg_sender);

    // get player
    const player = getPlayer(state, msg_sender);

    // get lobby item
    const item = state.lobby[address];

    if (!item) {
        player.message = createError({
            text: "Lobby item not found",
            timestamp,
        });
        return;
    }

    const opponent = item.player;
    const timeControl = item.timeControl;
    const bet = BigInt(item.bet);

    // calculate game address
    const gameAddress = getAddress(
        slice(
            keccak256(concat([numberToHex(input_index), msg_sender, opponent])),
            0,
            20,
        ),
    );

    // "random" color assignment
    // XXX: not really random, predictable, but that's ok
    const starter = hexToFraction(address);
    const white = starter > 0.5 ? msg_sender : opponent;
    const black = starter > 0.5 ? opponent : msg_sender;

    // create new chess.js game
    const chess = new Chess();
    chess.header("White", white);
    chess.header("Black", black);
    chess.header("Event", "Casual Game");
    chess.header("Site", "OnChess.xyz");

    // calculate initial clock
    const time = startTime(timeControl);

    // create game object
    const game: Game = {
        address: gameAddress,
        updatedAt: timestamp,
        white,
        black,
        whiteTime: time,
        blackTime: time,
        timeControl,
        pgn: chess.pgn(),
        pot: (bet * 2n).toString(), // 2x bet
        result: undefined,
    };
    state.games[gameAddress] = game;

    // remove lobby item
    delete state.lobby[address];
};
