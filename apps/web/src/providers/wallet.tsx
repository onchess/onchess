"use client";

import { type FC, type PropsWithChildren, useState } from "react";
import { base, baseSepolia, cannon } from "viem/chains";
import { cookieToInitialState } from "wagmi";
import { BasicWalletProvider } from "./wallet/basic";
import { getConfig } from "./wallet/config";
import { ReownWalletProvider } from "./wallet/reown";

export type WalletProviderType = "Coinbase" | "MetaMask" | "Reown" | "ZeroDev";

export const extractChain = () => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
    if (!chainId) {
        throw new Error("Missing NEXT_PUBLIC_CHAIN_ID");
    }
    if (Number.isNaN(Number.parseInt(chainId))) {
        throw new Error("Invalid NEXT_PUBLIC_CHAIN_ID");
    }
    switch (Number.parseInt(chainId)) {
        case base.id:
            return base;
        case baseSepolia.id:
            return baseSepolia;
        case cannon.id:
            return cannon;
        default:
            return cannon;
    }
};

export const getProviderType = (): WalletProviderType => {
    const type = process.env.NEXT_PUBLIC_WALLET_PROVIDER;
    if (!type) {
        throw new Error("Missing NEXT_PUBLIC_WALLET_PROVIDER");
    }
    switch (type) {
        case "Coinbase":
            return "Coinbase";
        case "MetaMask":
            return "MetaMask";
        case "Reown":
            return "Reown";
        case "ZeroDev":
            return "ZeroDev";
    }
    throw new Error(`Invalid NEXT_PUBLIC_WALLET_PROVIDER: ${type}`);
};

type WalletProviderProps = PropsWithChildren & { cookies: string | null };

export const WalletProvider: FC<WalletProviderProps> = ({
    children,
    cookies,
}) => {
    // read chain configuration from env
    const chain = extractChain();

    // read provider configuration from env
    const provider = getProviderType();

    // create wagmi config
    const [config] = useState(() => getConfig(provider, chain));

    // create wagmi initial state
    const initialState = cookieToInitialState(config, cookies);

    switch (provider) {
        case "Reown": {
            const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
            if (!projectId) {
                throw new Error("Missing NEXT_PUBLIC_REOWN_PROJECT_ID");
            }
            return (
                <ReownWalletProvider chain={chain} projectId={projectId}>
                    {children}
                </ReownWalletProvider>
            );
        }
        case "Coinbase":
        case "MetaMask":
        case "ZeroDev":
            return (
                <BasicWalletProvider
                    config={config}
                    initialState={initialState}
                    reconnectOnMount={true}
                >
                    {children}
                </BasicWalletProvider>
            );
    }
};
