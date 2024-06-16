import { Token } from "@onchess/core";
import { Address, getAddress } from "viem";

// rollups URL
export const url =
    process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/host-runner";

// owner configuration
export const owner: Address = getAddress(
    process.env.OWNER_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
);

const tokens: Record<Address, Token> = {
    "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2": {
        address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
        decimals: 18,
        name: "Test",
        symbol: "TEST",
    },
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        name: "USD Coin",
        symbol: "USDC",
    },
};

// token configuration
export const token: Token = tokens[
    getAddress(
        process.env.TOKEN_ADDRESS ||
            "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
    )
] ?? {
    address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
    decimals: 18,
    name: "Test",
    symbol: "TEST",
};

export const rakeDivider = 20; // (divider) 5%
export const eloKFactor = 20;
