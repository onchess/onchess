"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { base, baseSepolia, foundry } from "wagmi/chains";

const projectId = "2fc593e6b8e9da2434799b1111634ff0";
const metadata = {
    name: "OnChess",
    description: "OnChess is onchain chess",
    url: "https://onchess.xyz",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = defaultWagmiConfig({
    chains: [base, baseSepolia, foundry],
    projectId,
    metadata,
    enableCoinbase: false,
});

createWeb3Modal({
    wagmiConfig: config,
    projectId,
    themeVariables: {
        "--w3m-border-radius-master": "1px",
    },
    tokens: {
        1: {
            address: "0x491604c0FDF08347Dd1fa4Ee062a822A5DD06B5D",
            image: "https://s2.coinmarketcap.com/static/img/coins/64x64/5444.png",
        },
        42161: {
            address: "0x319f865b287fcc10b30d8ce6144e8b6d1b476999",
            image: "https://s2.coinmarketcap.com/static/img/coins/64x64/5444.png",
        },
        31337: {
            address: "0xf795b3D15D47ac1c61BEf4Cc6469EBb2454C6a9b",
            image: "https://s2.coinmarketcap.com/static/img/coins/64x64/5444.png",
        },
    },
});

declare module "wagmi" {
    interface Register {
        config: typeof config;
    }
}

const queryClient = new QueryClient();

export const WalletProvider: FC<{ children: ReactNode[] }> = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
