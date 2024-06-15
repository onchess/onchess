import { createApp } from "@deroll/app";
import { AppConfig, createChess } from "@onchess/core";
import { owner, rakeDivider, token, url } from "./config";

// create deroll app
const app = createApp({ url });
const config: AppConfig = {
    owner,
    rakeDivider,
    token,
};
createChess(app, config);

app.start().catch((e) => {
    console.error(e);
    process.exit(1);
});
