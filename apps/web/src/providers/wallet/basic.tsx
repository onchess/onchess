"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";
import { WagmiProvider, type WagmiProviderProps } from "wagmi";

export const BasicWalletProvider: FC<PropsWithChildren<WagmiProviderProps>> = (
    props,
) => {
    const queryClient = new QueryClient();
    return (
        <WagmiProvider {...props}>
            <QueryClientProvider client={queryClient}>
                {props.children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
