"use client";

import { FC, PropsWithChildren } from "react";
import { createConfig, http } from "wagmi";
import { Chain } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { BasicWalletProvider } from "./basic";

export type CoinbaseWalletProviderProps = PropsWithChildren<{
    chain: Chain;
}>;

export const CoinbaseWalletProvider: FC<CoinbaseWalletProviderProps> = (
    props,
) => {
    const { chain } = props;

    const config = createConfig({
        chains: [chain],
        connectors: [
            coinbaseWallet({
                appName: "OnChess",
                appLogoUrl: "https://onchess.xyz/img/onchess_logo.png",
                chainId: chain.id,
                preference: "smartWalletOnly",
            }),
        ],
        ssr: true,
        transports: {
            [chain.id]: http(),
        },
    });

    return <BasicWalletProvider {...props} config={config} />;
};
