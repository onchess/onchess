import type { PayloadAction } from "@reduxjs/toolkit";
import { getAddress } from "viem";
import { createError } from "../message.js";
import type { ChallengeBasePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import type { State } from "../state.js";
import { sum } from "../util.js";

export default (state: State, action: PayloadAction<ChallengeBasePayload>) => {
    // leave lobby
    const { address, metadata } = action.payload;
    const { block_timestamp } = metadata;
    const msg_sender = getAddress(metadata.msg_sender);

    // get player
    const player = getPlayer(state, msg_sender);

    // get challenge
    const challenge = state.lobby[address];

    if (!challenge) {
        player.message = createError({
            text: "Challenge not found",
            timestamp: block_timestamp,
        });
        return;
    }

    // check if player sending action is lobby player
    if (challenge.player !== player.address) {
        player.message = createError({
            text: "Not authorized",
            timestamp: block_timestamp,
        });
        return;
    }

    // return bet to player
    player.balance = sum(player.balance, challenge.bet);

    // remove lobby entry
    delete state.lobby[address];
};
