import { createERC20TransferVoucher } from "@deroll/wallet";
import { PayloadAction } from "@reduxjs/toolkit";
import { getAddress } from "viem";
import { createError } from "../message.js";
import { WithdrawPayload } from "../payloads.js";
import { getPlayer } from "../players.js";
import { State } from "../state.js";
import { subtract } from "../util.js";

export default (state: State, action: PayloadAction<WithdrawPayload>) => {
    const { metadata } = action.payload;
    const { timestamp } = metadata;
    const msg_sender = getAddress(metadata.msg_sender);
    const amount = BigInt(action.payload.amount);

    // get player
    const player = getPlayer(state, msg_sender);
    const balance = BigInt(player.balance);

    // check balance
    if (balance < amount) {
        player.message = createError({
            timestamp,
            text: "Insufficient funds",
        });
        return;
    }

    // deduct amount from balance
    player.balance = subtract(player.balance, action.payload.amount);

    // XXX: how to create voucher
    state.vouchers.push(
        createERC20TransferVoucher(
            state.config.token.address,
            msg_sender,
            amount,
        ),
    );
};
