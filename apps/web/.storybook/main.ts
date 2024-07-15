import type { StorybookConfig } from "@storybook/nextjs";
import { dirname, join } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    staticDirs: ["../public"],
    addons: [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-essentials"),
        getAbsolutePath("@storybook/addon-interactions"),
        getAbsolutePath("@storybook/addon-styling-webpack"),
        getAbsolutePath("storybook-dark-mode"),
    ],
    env: {
        NEXT_PUBLIC_WALLET_PROVIDER: "ZeroDev",
    },
    framework: {
        name: getAbsolutePath("@storybook/nextjs"),
        options: {},
    },
    docs: {},
};
export default config;
