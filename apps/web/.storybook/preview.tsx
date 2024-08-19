import "@mantine/core/styles.css";

import { useMantineColorScheme } from "@mantine/core";
import type { Preview } from "@storybook/react";
// biome-ignore lint/correctness/noUnusedImports: React
import React, { type ReactNode } from "react";
import { StyleProvider } from "../src/providers/style";
import { WalletProvider } from "../src/providers/wallet";

function ColorSchemeWrapper({ children }: { children: ReactNode }) {
    const { setColorScheme } = useMantineColorScheme();
    const handleColorScheme = (value: boolean) =>
        setColorScheme(value ? "dark" : "light");

    /*
    useEffect(() => {
        channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
        return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
    });
    */

    return <>{children}</>;
}

const preview: Preview = {
    decorators: [
        (Story) => (
            <StyleProvider>
                <ColorSchemeWrapper>
                    <WalletProvider cookies={null}>
                        <Story />
                    </WalletProvider>
                </ColorSchemeWrapper>
            </StyleProvider>
        ),
    ],
    parameters: {
        darkMode: {
            current: "light",
            dark: { appBg: "black" },
            light: { appBg: "white" },
        },
    },
    tags: ["autodocs"],
};

export default preview;
