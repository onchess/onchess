"use client";

import { passkeyConnector, wrapSmartWallet } from "@zerodev/wallet";
import { FC, PropsWithChildren } from "react";
import { createConfig, http } from "wagmi";
import { Chain } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";
import { BasicWalletProvider } from "./basic";

export type ZeroDevWalletProviderProps = PropsWithChildren<{
    chain: Chain;
    projectId: string;
}>;

export const ZeroDevWalletProvider: FC<ZeroDevWalletProviderProps> = (
    props,
) => {
    const { chain, projectId } = props;
    const config = createConfig({
        chains: [chain],
        connectors: [
            wrapSmartWallet(
                metaMask({
                    dappMetadata: {
                        name: "OnChess",
                    },
                }),
                projectId,
                "v3",
            ),
            passkeyConnector(projectId, chain, "v3", "OnChess"),
        ],
        ssr: true,
        transports: {
            [chain.id]: http(),
        },
    });
    return <BasicWalletProvider {...props} config={config} />;
};
