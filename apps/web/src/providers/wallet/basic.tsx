"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";
import { WagmiProvider, WagmiProviderProps } from "wagmi";

export const BasicWalletProvider: FC<PropsWithChildren<WagmiProviderProps>> = (
    props,
) => {
    const queryClient = new QueryClient();
    return (
        <WagmiProvider config={props.config}>
            <QueryClientProvider client={queryClient}>
                {props.children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
