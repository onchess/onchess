import "@mantine/carousel/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";

import { StyleProvider } from "../providers/style";
import { WalletProvider } from "../providers/wallet";

export const metadata = {
    title: "OnChess",
    description: "OnChain Chess Game",
};

const RootLayout = ({ children }: { children: React.ReactNode[] }) => {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
                <link rel="shortcut icon" href="/favicon.svg" />
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
                />
            </head>
            <body>
                <StyleProvider>
                    <WalletProvider>{children}</WalletProvider>
                </StyleProvider>
            </body>
        </html>
    );
};

export default RootLayout;
