import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { arbitrum, foundry } from "wagmi/chains";

const projectId = "2fc593e6b8e9da2434799b1111634ff0";
const metadata = {
    name: "OnChess",
    description: "OnChess is onchain chess",
    url: "https://onchess.xyz",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = defaultWagmiConfig({
    chains: [arbitrum, foundry],
    projectId,
    metadata,
});

createWeb3Modal({
    wagmiConfig: config,
    projectId,
});

declare module "wagmi" {
    interface Register {
        config: typeof config;
    }
}
