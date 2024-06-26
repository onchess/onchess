import { PayloadAction } from "@reduxjs/toolkit";
import { getAddress } from "viem";
import { DepositPayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";
import { sum } from "../util.js";

export default (state: State, action: PayloadAction<DepositPayload>) => {
    // create player if not exists
    const address = getAddress(action.payload.sender);
    const player = getPlayer(state, address);

    // add balance
    player.balance = sum(player.balance, action.payload.amount);
};
