import type { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { getAddress } from "viem";
import { terminateGame } from "../game.js";
import { createError } from "../message.js";
import type { MovePiecePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import type { State } from "../state.js";
import { parseTimeControl } from "../time.js";

export default (state: State, action: PayloadAction<MovePiecePayload>) => {
    // move a piece
    const { metadata } = action.payload;
    const blockTimestamp = Number(metadata.blockTimestamp);
    const msgSender = getAddress(metadata.msgSender);
    const { address, move } = action.payload;

    // get player
    const player = getPlayer(state, msgSender);

    // get game
    const game = state.games[getAddress(address)];
    if (!game) {
        // game not found
        player.message = createError({
            text: `Game not found: ${address}`,
            timestamp: blockTimestamp,
        });
        return;
    }

    // check player access
    if (msgSender !== game.white && msgSender !== game.black) {
        player.message = createError({
            text: `Unauthorized game: ${address}`,
            timestamp: blockTimestamp,
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
            timestamp: blockTimestamp,
        });
        return;
    }

    // check players turn
    const turn = chess.turn();
    if (
        (turn === "w" && msgSender !== game.white) ||
        (turn === "b" && msgSender !== game.black)
    ) {
        player.message = createError({
            text: "Not your turn",
            timestamp: blockTimestamp,
        });
        return;
    }

    // check time control
    const elapsedTime = blockTimestamp - game.updatedAt;
    const timeLeft = turn === "w" ? game.whiteTime : game.blackTime;
    if (elapsedTime > timeLeft) {
        player.message = createError({
            text: "Out of time",
            timestamp: blockTimestamp,
        });

        // give victory to opponent
        const whitePlayer = getPlayer(state, game.white);
        const blackPlayer = getPlayer(state, game.black);
        const result = turn === "w" ? 0 : 1;
        terminateGame(state, game, chess, whitePlayer, blackPlayer, result);
        return;
    }

    // make the move
    try {
        chess.move(move, { strict: true });
    } catch {
        player.message = createError({
            text: `Invalid move: ${move}`,
            timestamp: blockTimestamp,
        });
        return;
    }

    // update game timestamp
    game.updatedAt = blockTimestamp;

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
        terminateGame(state, game, chess, whitePlayer, blackPlayer, result);
    } else if (
        chess.isInsufficientMaterial() ||
        chess.isStalemate() ||
        chess.isInsufficientMaterial()
    ) {
        // terminate game with draw
        terminateGame(state, game, chess, whitePlayer, blackPlayer, 0.5);
    }
};
