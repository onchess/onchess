"use client";

import { type FC, type PropsWithChildren, useState } from "react";
import { base, baseSepolia, cannon } from "viem/chains";
import { cookieToInitialState } from "wagmi";
import { BasicWalletProvider } from "./wallet/basic";
import { getConfig } from "./wallet/config";

export const extractChain = () => {
    const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
    if (!chainId) {
        throw new Error("Missing NEXT_PUBLIC_CHAIN_ID");
    }
    if (Number.isNaN(Number.parseInt(chainId, 10))) {
        throw new Error("Invalid NEXT_PUBLIC_CHAIN_ID");
    }
    switch (Number.parseInt(chainId, 10)) {
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

type WalletProviderProps = PropsWithChildren & { cookies: string | null };

export const WalletProvider: FC<WalletProviderProps> = ({
    children,
    cookies,
}) => {
    // read chain configuration from env
    const chain = extractChain();

    // create wagmi config with the JAW connector
    const [config] = useState(() => getConfig(chain));

    // create wagmi initial state
    const initialState = cookieToInitialState(config, cookies);

    return (
        <BasicWalletProvider
            config={config}
            initialState={initialState}
            reconnectOnMount={true}
        >
            {children}
        </BasicWalletProvider>
    );
};
