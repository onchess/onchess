import { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { getAddress } from "viem";
import { terminateGame } from "../game.js";
import { createError } from "../message.js";
import { MovePiecePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";
import { parseTimeControl } from "../time.js";
import { AppConfig } from "../types.js";

export default (config: AppConfig) =>
    (state: State, action: PayloadAction<MovePiecePayload>) => {
        const { rakeDivider } = config;

        // move a piece
        const { metadata } = action.payload;
        const { timestamp } = metadata;
        const msg_sender = getAddress(metadata.msg_sender);
        const { address, move } = action.payload;

        // get player
        const player = getPlayer(state, msg_sender);

        // get game
        const game = state.games[getAddress(address)];
        if (!game) {
            // game not found
            player.message = createError({
                text: `Game not found: ${address}`,
                timestamp,
            });
            return;
        }

        // check player access
        if (msg_sender !== game.white && msg_sender !== game.black) {
            player.message = createError({
                text: `Unauthorized game: ${address}`,
                timestamp,
            });
            return;
        }

        // load chess game
        const chess = new Chess();
        chess.loadPgn(game.pgn);

        // check if game is already over
        if (chess.isGameOver()) {
            player.message = createError({
                text: "Game is already over",
                timestamp,
            });
            return;
        }

        // check players turn
        const turn = chess.turn();
        if (
            (turn === "w" && msg_sender !== game.white) ||
            (turn === "b" && msg_sender !== game.black)
        ) {
            player.message = createError({ text: "Not your turn", timestamp });
            return;
        }

        // check time control
        const elapsedTime = timestamp - game.updatedAt;
        const timeLeft = turn === "w" ? game.whiteTime : game.blackTime;
        if (elapsedTime > timeLeft) {
            player.message = createError({ text: "Out of time", timestamp });

            // give victory to opponent
            const whitePlayer = getPlayer(state, game.white);
            const blackPlayer = getPlayer(state, game.black);
            const result = turn === "w" ? 0 : 1;
            terminateGame(
                state,
                game,
                whitePlayer,
                blackPlayer,
                result,
                rakeDivider,
            );
            return;
        }

        // make the move
        try {
            chess.move(move, { strict: true });
        } catch (e: unknown) {
            player.message = createError({
                text: `Invalid move: ${move}`,
                timestamp,
            });
            return;
        }

        // update game timestamp
        game.updatedAt = timestamp;

        // update player clock
        const [_, extraMoveTime] = parseTimeControl(game.timeControl);
        const deltaTime = -elapsedTime + extraMoveTime;
        if (turn === "w") {
            game.whiteTime += deltaTime;
        } else {
            game.blackTime += deltaTime;
        }

        // update game pgn
        game.pgn = chess.pgn();

        // check win condition
        const whitePlayer = getPlayer(state, game.white);
        const blackPlayer = getPlayer(state, game.black);
        if (chess.isCheckmate()) {
            // terminate game, if white moved, he wins, otherwise black wins
            const result = turn === "w" ? 1 : 0;
            terminateGame(
                state,
                game,
                whitePlayer,
                blackPlayer,
                result,
                rakeDivider,
            );
        } else if (
            chess.isInsufficientMaterial() ||
            chess.isStalemate() ||
            chess.isInsufficientMaterial()
        ) {
            // terminate game with draw
            terminateGame(
                state,
                game,
                whitePlayer,
                blackPlayer,
                0.5,
                rakeDivider,
            );
        }
    };
