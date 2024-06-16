import { createApp } from "@deroll/app";
import { Config, createChess } from "@onchess/core";
import { eloKFactor, owner, rakeDivider, token, url } from "./config";

// create deroll app
const app = createApp({ url });
const config: Config = {
    eloKFactor,
    owner,
    rakeDivider,
    token,
};
createChess(app, config);

app.start().catch((e) => {
    console.error(e);
    process.exit(1);
});
