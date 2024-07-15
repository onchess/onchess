import "@mantine/core/styles.css";

import { useMantineColorScheme } from "@mantine/core";
import { addons } from "@storybook/preview-api";
import { Preview } from "@storybook/react";
import { themes } from "@storybook/theming";
import React, { ReactNode, useEffect } from "react";
import { DARK_MODE_EVENT_NAME } from "storybook-dark-mode";
import { StyleProvider } from "../src/providers/style";
import { WalletProvider } from "../src/providers/wallet";

const channel = addons.getChannel();

function ColorSchemeWrapper({ children }: { children: ReactNode }) {
    const { setColorScheme } = useMantineColorScheme();
    const handleColorScheme = (value: boolean) =>
        setColorScheme(value ? "dark" : "light");

    useEffect(() => {
        channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
        return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
    }, [channel]);

    return <>{children}</>;
}

const preview: Preview = {
    decorators: [
        (Story) => (
            <StyleProvider>
                <ColorSchemeWrapper>
                    <WalletProvider>
                        <Story />
                    </WalletProvider>
                </ColorSchemeWrapper>
            </StyleProvider>
        ),
    ],
    parameters: {
        darkMode: {
            current: "light",
            dark: { ...themes.dark, appBg: "black" },
            light: { ...themes.light, appBg: "white" },
        },
    },
    tags: ["autodocs"],
};

export default preview;
