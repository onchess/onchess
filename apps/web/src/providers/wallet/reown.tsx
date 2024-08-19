"use client";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { FC, PropsWithChildren, useEffect } from "react";
import { Chain } from "wagmi/chains";
import { BasicWalletProvider } from "./basic";

export type ReownWalletProviderProps = PropsWithChildren<{
    chain: Chain;
    projectId: string;
}>;

export const ReownWalletProvider: FC<ReownWalletProviderProps> = (props) => {
    const { chain, projectId } = props;

    const metadata = {
        name: "OnChess",
        description: "OnChess is onchain chess",
        url: "https://onchess.xyz",
        icons: ["https://onchess.xyz/img/onchess_logo.png"],
    };

    const wagmiAdapter = new WagmiAdapter({
        networks: [chain],
        projectId,
        ssr: true,
    });

    useEffect(() => {
        createAppKit({
            adapters: [wagmiAdapter],
            features: {
                analytics: true,
            },
            metadata,
            networks: [chain],
            projectId,
            themeMode: "light",
            themeVariables: {
                "--w3m-border-radius-master": "1px",
            },
        });
    }, []);

    return <BasicWalletProvider {...props} config={wagmiAdapter.wagmiConfig} />;
};
