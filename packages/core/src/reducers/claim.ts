import { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { getAddress } from "viem";
import { terminateGame } from "../game.js";
import { createError } from "../message.js";
import { GameBasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";

export default (state: State, action: PayloadAction<GameBasePayload>) => {
    const { metadata } = action.payload;
    const { timestamp } = metadata;
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
            timestamp,
        });
        return;
    }

    // check player access
    if (msg_sender !== game.white && msg_sender !== game.black) {
        player.message = createError({
            text: "Unauthorized game",
            timestamp,
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
    const elapsedTime = timestamp - game.updatedAt;
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
            timestamp,
        });
    }
};
