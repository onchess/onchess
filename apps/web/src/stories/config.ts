import type { Config, Token } from "@onchess/core";
import { zeroAddress } from "viem";

export const token: Token = {
    address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
    decimals: 18,
    name: "Test",
    symbol: "TEST",
};

export const config: Config = {
    eloKFactor: 20,
    owner: zeroAddress,
    rakeDivider: 20,
    token,
};
