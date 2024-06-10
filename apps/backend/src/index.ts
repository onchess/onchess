import { createApp } from "@deroll/app";
import { AppConfig, createChess } from "@onchess/core";
import { Address, getAddress } from "viem";

// token configuration
const token: Address = process.env.TOKEN_ADDRESS
    ? getAddress(process.env.TOKEN_ADDRESS)
    : "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2";

const rakeDivider = 20n; // (divider) 5%
const rakeAddress = process.env.RAKE_ADDRESS;

// create deroll app
const url =
    process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/host-runner";
const app = createApp({ url });
const config: AppConfig = {
    rakeDivider,
    token: {
        address: token,
        decimals: 18,
        name: "Test Token",
        symbol: "TEST",
    },
};
createChess(app, config);

app.start().catch((e) => {
    console.error(e);
    process.exit(1);
});
