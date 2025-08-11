import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    staticDirs: ["../public"],
    addons: ["@storybook/addon-links"],
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
