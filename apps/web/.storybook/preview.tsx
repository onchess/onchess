import "@mantine/core/styles.css";

import { useMantineColorScheme } from "@mantine/core";
import { addons } from "@storybook/preview-api";
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

export const decorators = [
    (renderStory: any) => (
        <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>
    ),
    (renderStory: any) => (
        <StyleProvider>
            <WalletProvider>{renderStory()}</WalletProvider>
        </StyleProvider>
    ),
];
