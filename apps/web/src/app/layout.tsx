import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import { headers } from "next/headers";
import { CartesiProvider } from "../providers/cartesi";
import { StateProvider } from "../providers/state";
import { StyleProvider } from "../providers/style";
import { WalletProvider } from "../providers/wallet";

export const metadata = {
    title: "OnChess",
    description: "OnChain Chess Game",
};

const RootLayout = async ({ children }: { children: React.ReactNode[] }) => {
    const cookies = (await headers()).get("cookie");
    return (
        <html lang="en" suppressHydrationWarning={true}>
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
                    <WalletProvider cookies={cookies}>
                        <CartesiProvider>
                            <StateProvider>{children}</StateProvider>
                        </CartesiProvider>
                    </WalletProvider>
                </StyleProvider>
            </body>
        </html>
    );
};

export default RootLayout;
