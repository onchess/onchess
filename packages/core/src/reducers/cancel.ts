import { PayloadAction } from "@reduxjs/toolkit";
import { getAddress } from "viem";
import { createError } from "../message.js";
import { LobbyBasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";
import { sum } from "../util.js";

export default (state: State, action: PayloadAction<LobbyBasePayload>) => {
    // leave lobby
    const { address, metadata } = action.payload;
    const { timestamp } = metadata;
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

    // check if player sending action is lobby player
    if (item.player !== player.address) {
        player.message = createError({
            text: "Not authorized",
            timestamp,
        });
        return;
    }

    // return bet to player
    player.balance = sum(player.balance, item.bet);

    // remove lobby entry
    delete state.lobby[address];
};
