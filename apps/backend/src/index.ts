import { createApp } from "@deroll/app";
import { type State, createChess } from "@onchess/core";
import { getConfig } from "./config";

// create deroll app
const app = createApp();

// load configuration for the chain
const chainId = Number.parseInt(process.env.CHAIN_ID ?? "31337");
console.log(
    `starting application for chain ${chainId} with the following configuration`,
);

const config = getConfig(chainId);
console.log(config);

// create chess app
const initialState: State = {
    config,
    games: {},
    lobby: {},
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
