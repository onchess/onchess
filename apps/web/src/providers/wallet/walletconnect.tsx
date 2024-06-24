"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { FC, PropsWithChildren, useEffect } from "react";
import { Chain } from "wagmi/chains";
import { BasicWalletProvider } from "./basic";

export type WalletConnectWalletProviderProps = PropsWithChildren<{
    chain: Chain;
    projectId: string;
}>;

export const WalletConnectWalletProvider: FC<
    WalletConnectWalletProviderProps
> = (props) => {
    const { chain, projectId } = props;

    const metadata = {
        name: "OnChess",
        description: "OnChess is onchain chess",
        url: "https://onchess.xyz",
        icons: ["https://onchess.xyz/img/onchess_logo.png"],
    };

    const config = defaultWagmiConfig({
        chains: [chain],
        metadata,
        projectId,
        ssr: true,
    });

    useEffect(() => {
        createWeb3Modal({
            enableAnalytics: true,
            themeMode: "light",
            projectId,
            themeVariables: {
                "--w3m-border-radius-master": "1px",
            },
            wagmiConfig: config,
        });
    }, []);

    return <BasicWalletProvider {...props} config={config} />;
};
