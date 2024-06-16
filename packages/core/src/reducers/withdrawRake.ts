import { createERC20TransferVoucher } from "@deroll/wallet";
import { PayloadAction } from "@reduxjs/toolkit";
import { BasePayload } from "../payloads.js";
import { State } from "../state.js";

export default (state: State, _action: PayloadAction<BasePayload>) => {
    // get balance
    const balance = BigInt(state.rake);

    // check balance
    if (balance == 0n) {
        // no rake to withdraw
        return;
    }

    // reset rake
    state.rake = "0";

    // create voucher to transfer to app owner
    state.vouchers.push(
        createERC20TransferVoucher(
            state.config.token.address,
            state.config.owner,
            balance,
        ),
    );
};
