import { createApp } from "@deroll/app";
import { State, createChess } from "@onchess/core";
import { getConfig } from "./config";

// rollups URL
export const url =
    process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:8080/host-runner";

// create deroll app
const app = createApp({ url });

// load configuration for the chain
const chainId = parseInt(process.env.CHAIN_ID ?? "31337");
console.log(
    `starting application for chain ${chainId} with the following configuration`,
);

const config = getConfig(chainId);
console.log(config);

// create chess app
const initialState: State = {
    config,
    games: {},
    lobby: [],
    players: {},
    rake: "0",
    vouchers: [],
    isShutdown: false,
};
createChess(app, initialState);

app.start().catch((e) => {
    console.error(e);
    process.exit(1);
});
