import type { Config, Token } from "@onchess/core";
import { zeroAddress } from "viem";

export const token: Token = {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
};

export const config: Config = {
    eloKFactor: 20,
    owner: zeroAddress,
    rakeDivider: 20,
    token,
};
