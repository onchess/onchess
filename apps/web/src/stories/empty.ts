import type { State } from "@onchess/core";
import { zeroAddress } from "viem";
import { token } from "./config";

export default {
    config: {
        eloKFactor: 20,
        owner: zeroAddress,
        rakeDivider: 20,
        token,
    },
    games: {},
    lobby: {},
    messages: {},
    players: {},
    rake: "0",
    vouchers: [],
    isShutdown: false,
} as State;
