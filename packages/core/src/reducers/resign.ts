import { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { getAddress } from "viem";
import { terminateGame } from "../game.js";
import { createError } from "../message.js";
import { GameBasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";
import { AppConfig } from "../types.js";

export default (config: AppConfig) =>
    (state: State, action: PayloadAction<GameBasePayload>) => {
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
        if (player.address !== game.white && player.address !== game.black) {
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
        if (
            (turn === "w" && player.address !== game.white) ||
            (turn === "b" && player.address !== game.black)
        ) {
            player.message = createError({
                text: "Not your turn",
                timestamp,
            });
            return;
        }

        const whitePlayer = getPlayer(state, game.white);
        const blackPlayer = getPlayer(state, game.black);

        // if white is resigning black wins, otherwise white wins
        const result = turn === "w" ? 0 : 1;
        terminateGame(
            state,
            game,
            whitePlayer,
            blackPlayer,
            result,
            config.rakeDivider,
        );
    };
