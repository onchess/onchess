"use client";

import { FC, PropsWithChildren } from "react";
import { base, baseSepolia, cannon } from "wagmi/chains";
import { ReownWalletProvider } from "./wallet/reown";
import { ZeroDevWalletProvider } from "./wallet/zerodev";

export type WalletProviderType = "ZeroDev" | "Reown";

export const extractChain = () => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
    if (!chainId) {
        throw new Error("Missing NEXT_PUBLIC_CHAIN_ID");
    }
    if (isNaN(parseInt(chainId))) {
        throw new Error("Invalid NEXT_PUBLIC_CHAIN_ID");
    }
    switch (parseInt(chainId)) {
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
        case "Reown":
            return "Reown";
        case "ZeroDev":
            return "ZeroDev";
    }
    throw new Error(`Invalid NEXT_PUBLIC_WALLET_PROVIDER: ${type}`);
};

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
    // read chain configuration from env
    const chain = extractChain();

    // read provider configuration from env
    const provider = getProviderType();

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
        case "ZeroDev": {
            const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
            if (!projectId) {
                throw new Error("Missing NEXT_PUBLIC_ZERODEV_PROJECT_ID");
            }
            return (
                <ZeroDevWalletProvider chain={chain} projectId={projectId}>
                    {children}
                </ZeroDevWalletProvider>
            );
        }
    }
};
