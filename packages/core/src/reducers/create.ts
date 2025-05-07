import type { PayloadAction } from "@reduxjs/toolkit";
import { concat, getAddress, keccak256, numberToHex, slice } from "viem";
import { createError } from "../message.js";
import type { CreateGamePayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import type { LobbyItem, State } from "../state.js";
import { supportedTimeControls } from "../time.js";

export default (state: State, action: PayloadAction<CreateGamePayload>) => {
    const { metadata } = action.payload;
    const { input_index, block_timestamp } = metadata;
    const msg_sender = getAddress(metadata.msg_sender);

    // get player (add player if not exists)
    const player = getPlayer(state, msg_sender);

    // deny if application is shutdown
    if (state.isShutdown) {
        player.message = createError({
            text: "Application is shutdown",
            timestamp: block_timestamp,
        });
        return;
    }

    // get game parameters
    const { timeControl, minRating, maxRating } = action.payload;
    const bet = BigInt(action.payload.bet);
    const balance = BigInt(player.balance);

    // validate timeControl
    if (supportedTimeControls.indexOf(timeControl) < 0) {
        player.message = createError({
            text: `Unsupported time control: ${timeControl}`,
            timestamp: block_timestamp,
        });
        return;
    }

    // TODO: validate bet

    // check if player has enough balance
    if (balance < bet) {
        // player don't have enough funds
        player.message = createError({
            text: "Not enough funds",
            timestamp: block_timestamp,
        });
        return;
    }

    // subtract bet from player balance
    player.balance = (balance - bet).toString();

    // calculate lobby address
    const address = getAddress(
        slice(keccak256(concat([numberToHex(input_index), msg_sender])), 0, 20),
    );

    // create lobby item
    const lobbyItem: LobbyItem = {
        address,
        bet: bet.toString(),
        createdAt: block_timestamp,
        player: msg_sender,
        timeControl,
        minRating,
        maxRating,
    };

    // add to end of lobby
    state.lobby[address] = lobbyItem;
};
