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
    const blockTimestamp = Number(metadata.blockTimestamp);
    const msgSender = getAddress(metadata.msgSender);
    const { address } = action.payload;

    // get player
    const player = getPlayer(state, msgSender);

    // get game
    const game = state.games[getAddress(address)];
    if (!game) {
        // game not found
        player.message = createError({
            text: "Game not found",
            timestamp: blockTimestamp,
        });
        return;
    }

    // check player access
    if (msgSender !== game.white && msgSender !== game.black) {
        player.message = createError({
            text: "Unauthorized game",
            timestamp: blockTimestamp,
        });
        return;
    }

    // deny if game is already terminated
    if (game.result !== undefined) {
        player.message = createError({
            text: "Game already terminated",
            timestamp: blockTimestamp,
        });
        return;
    }

    // load chess game
    const chess = new Chess();
    chess.loadPgn(game.pgn);

    // check players turn
    const turn = chess.turn();

    // check if opponent is out of time
    const opponentTime = turn === "w" ? game.blackTime : game.whiteTime;

    // amount of time passed since last move
    const elapsedTime = blockTimestamp - game.updatedAt;
    if (elapsedTime > opponentTime) {
        // opponent clock was over, allow victory claim

        const whitePlayer = getPlayer(state, game.white);
        const blackPlayer = getPlayer(state, game.black);

        // if white is claiming white wins, otherwise black wins
        const result = turn === "w" ? 1 : 0;
        terminateGame(state, game, chess, whitePlayer, blackPlayer, result);
    } else {
        // opponent still has time
        player.message = createError({
            text: "Opponent still has time",
            timestamp: blockTimestamp,
        });
    }
};
