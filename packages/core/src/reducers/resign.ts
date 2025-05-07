import type { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { getAddress } from "viem";
import { terminateGame } from "../game.js";
import { createError } from "../message.js";
import type { GameBasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import type { State } from "../state.js";

export default (state: State, action: PayloadAction<GameBasePayload>) => {
    const { metadata } = action.payload;
    const { block_timestamp } = metadata;
    const msg_sender = getAddress(metadata.msg_sender);
    const { address } = action.payload;

    // get player
    const player = getPlayer(state, msg_sender);

    // get game
    const game = state.games[getAddress(address)];
    if (!game) {
        // game not found
        player.message = createError({
            text: "Game not found",
            timestamp: block_timestamp,
        });
        return;
    }

    // check player access
    if (player.address !== game.white && player.address !== game.black) {
        player.message = createError({
            text: "Unauthorized game",
            timestamp: block_timestamp,
        });
        return;
    }

    // load chess game
    const chess = new Chess();
    chess.loadPgn(game.pgn);

    const whitePlayer = getPlayer(state, game.white);
    const blackPlayer = getPlayer(state, game.black);

    // if white is resigning black wins, otherwise white wins
    const result = player.address === game.white ? 0 : 1;

    // add resignation comment to PGN
    switch (result) {
        case 1:
            chess.setComment("Black resigns");
            break;
        case 0:
            chess.setComment("White resigns");
            break;
    }

    terminateGame(state, game, chess, whitePlayer, blackPlayer, result);
};
