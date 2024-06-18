"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { FC, ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { base, baseSepolia, foundry } from "wagmi/chains";

const projectId = "2fc593e6b8e9da2434799b1111634ff0";
const metadata = {
    name: "OnChess",
    description: "OnChess is onchain chess",
    url: "https://onchess.xyz",
    icons: ["https://onchess.xyz/img/onchess_logo.png"],
};

export const config = defaultWagmiConfig({
    chains: [base, baseSepolia, foundry],
    enableCoinbase: false,
    enableWalletConnect: false,
    metadata,
    projectId,
    ssr: true,
});

createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true,
    themeVariables: {
        "--w3m-border-radius-master": "1px",
    },
});

declare module "wagmi" {
    interface Register {
        config: typeof config;
    }
}

const queryClient = new QueryClient();

export interface WalletProviderProps {
    children: ReactNode[];
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
