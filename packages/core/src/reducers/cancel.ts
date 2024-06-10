import { PayloadAction } from "@reduxjs/toolkit";
import { getAddress } from "viem";
import { BasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";
import { sum } from "../util.js";

export default (state: State, action: PayloadAction<BasePayload>) => {
    // leave lobby (can be multiple entries)
    const { metadata } = action.payload;
    const msg_sender = getAddress(metadata.msg_sender);

    // get player
    const player = getPlayer(state, msg_sender);

    // return bet to player
    state.lobby.forEach((item) => {
        if (item.player === msg_sender) {
            // return bet to player
            player.balance = sum(player.balance, item.bet);
        }
    });

    // remove all entries of player
    state.lobby = state.lobby.filter((item) => item.player !== msg_sender);
};
