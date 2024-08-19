import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    staticDirs: ["../public"],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "storybook-dark-mode",
    ],
    env: {
        NEXT_PUBLIC_WALLET_PROVIDER: "ZeroDev",
    },
    framework: {
        name: "@storybook/nextjs",
        options: {},
    },
    docs: {},
};
export default config;
