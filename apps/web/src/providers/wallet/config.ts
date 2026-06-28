import { jaw } from "@jaw.id/wagmi";
import type { Chain } from "viem";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";

export const getConfig = (chain: Chain) => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    if (!rpcUrl) {
        throw new Error("Missing NEXT_PUBLIC_RPC_URL");
    }

    const apiKey = process.env.NEXT_PUBLIC_JAW_API_KEY;
    if (!apiKey) {
        throw new Error("Missing NEXT_PUBLIC_JAW_API_KEY");
    }

    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

    return createConfig({
        chains: [chain],
        connectors: [
            jaw({
                apiKey,
                appName: "OnChess",
                appLogoUrl: "https://onchess.xyz/img/onchess_logo.png",
                defaultChainId: chain.id,
                preference: {
                    showTestnets: chain.testnet,
                },
                ...(paymasterUrl
                    ? { paymasters: { [chain.id]: { url: paymasterUrl } } }
                    : {}),
            }),
        ],
        ssr: true,
        storage: createStorage({ storage: cookieStorage }),
        transports: {
            [chain.id]: http(rpcUrl),
        },
    });
};
