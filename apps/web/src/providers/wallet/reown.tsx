"use client";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { type FC, type PropsWithChildren, useEffect } from "react";
import { http } from "viem";
import { cookieStorage, createStorage } from "wagmi";
import type { Chain } from "wagmi/chains";
import { BasicWalletProvider } from "./basic";

export type ReownWalletProviderProps = PropsWithChildren<{
    chain: Chain;
    projectId: string;
}>;

export const ReownWalletProvider: FC<ReownWalletProviderProps> = (props) => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    if (!rpcUrl) {
        throw new Error("Missing NEXT_PUBLIC_RPC_URL");
    }
    const { chain, projectId } = props;

    const metadata = {
        name: "OnChess",
        description: "OnChess is onchain chess",
        // url: "https://onchess.xyz",
        url: "http://localhost:3000",
        icons: ["https://onchess.xyz/img/onchess_logo.png"],
    };

    const wagmiAdapter = new WagmiAdapter({
        networks: [chain],
        projectId,
        transports: {
            [chain.id]: http(rpcUrl),
        },
        ssr: true,
        storage: createStorage({ storage: cookieStorage }),
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
    }, [chain, projectId, wagmiAdapter]);

    return <BasicWalletProvider {...props} config={wagmiAdapter.wagmiConfig} />;
};
