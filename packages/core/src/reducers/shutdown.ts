import { PayloadAction } from "@reduxjs/toolkit";
import { Chess } from "chess.js";
import { getAddress } from "viem";
import { terminateGame } from "../game.js";
import { BasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";
import { sum } from "../util.js";

export default (state: State, action: PayloadAction<BasePayload>) => {
    const { payload } = action;
    const { metadata } = payload;
    const owner = state.config.owner;

    // check permission
    if (getAddress(metadata.msg_sender) !== owner) {
        // only current owner can shutdown application
        return;
    }

    // cancel all lobbies, returning bet to player
    Object.values(state.lobby).forEach((item) => {
        const player = getPlayer(state, item.player);
        player.balance = sum(player.balance, item.bet);
    });

    // clear lobby
    state.lobby = {};

    // terminate all games as draw
    Object.values(state.games).forEach((game) => {
        const chess = new Chess();
        chess.loadPgn(game.pgn);
        const white = getPlayer(state, game.white);
        const black = getPlayer(state, game.black);

        // terminate game as draw
        terminateGame(state, game, chess, white, black, 0.5);
    });

    // set shutdown flag
    state.isShutdown = true;
};
