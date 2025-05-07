import type { PayloadAction } from "@reduxjs/toolkit";
import { getAddress } from "viem";
import type { SetRakeDividerPayload } from "../payloads.js";
import type { State } from "../state.js";

export default (state: State, action: PayloadAction<SetRakeDividerPayload>) => {
    const { metadata } = action.payload;

    // check permission
    if (getAddress(metadata.msg_sender) !== getAddress(state.config.owner)) {
        // only current owner can transfer ownership
        return;
    }

    // change rake divider value
    state.config.rakeDivider = action.payload.value;
};
