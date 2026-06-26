import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    staticDirs: ["../public"],
    addons: ["@storybook/addon-links"],
    // Stories are wrapped in WalletProvider (see preview.tsx), which reads these
    // at render time. Storybook 10's nextjs framework no longer auto-loads
    // `.env`, so declare the values the provider needs (dev placeholders —
    // stories never make network/wallet calls).
    env: {
        NEXT_PUBLIC_CHAIN_ID: "31337",
        NEXT_PUBLIC_RPC_URL: "http://127.0.0.1:6751/anvil",
        NEXT_PUBLIC_JAW_API_KEY: "storybook",
    },
    framework: {
        name: "@storybook/nextjs",
        options: {},
    },
    docs: {},
};
export default config;
