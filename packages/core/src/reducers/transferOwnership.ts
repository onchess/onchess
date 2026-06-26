import type { PayloadAction } from "@reduxjs/toolkit";
import { getAddress } from "viem";
import type { TransferOwnershipPayload } from "../payloads.js";
import type { State } from "../state.js";

export default (
    state: State,
    action: PayloadAction<TransferOwnershipPayload>,
) => {
    const { metadata } = action.payload;

    // check permission
    if (getAddress(metadata.msgSender) !== getAddress(state.config.owner)) {
        // only current owner can perform this action
        return;
    }

    // change owner
    state.config.owner = action.payload.newOwner;
};
