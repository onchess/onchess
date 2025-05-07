import { type Chain, parseEther, toHex } from "viem";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { coinbaseWallet, metaMask } from "wagmi/connectors";
import type { WalletProviderType } from "../wallet";
import { passkeyConnector } from "./zerodev/passkeyConnector";

const getConnectors = (
    walletType: WalletProviderType,
    chain: Chain,
    rpcUrl: string,
) => {
    const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_RPC_URL;
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;
    const passkeyServerUrl = process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL;
    if (!bundlerUrl) {
        throw new Error("Missing NEXT_PUBLIC_BUNDLER_RPC_URL");
    }
    if (!passkeyServerUrl) {
        throw new Error("Missing NEXT_PUBLIC_PASSKEY_SERVER_URL");
    }

    switch (walletType) {
        case "MetaMask":
            return [
                metaMask({
                    dappMetadata: {
                        name: "OnChess",
                        url: "https//onchess.xyz",
                        iconUrl: "https://onchess.xyz/img/onchess_logo.png",
                    },
                }),
            ];

        case "Coinbase":
            return [
                coinbaseWallet({
                    appName: "OnChess",
                    appLogoUrl: "https://onchess.xyz/img/onchess_logo.png",
                    chainId: chain.id,
                    preference: {
                        keysUrl: "https://keys-dev.coinbase.com/connect",
                        options: "smartWalletOnly",
                    },
                    subAccounts: {
                        enableAutoSubAccounts: true,
                        defaultSpendLimits: {
                            [chain.id]: [
                                {
                                    token: "0xFBdB734EF6a23aD76863CbA6f10d0C5CBBD8342C",
                                    allowance: toHex(parseEther("0.01")), // 0.01 ETH
                                    period: 86400, // 24h
                                },
                            ],
                        },
                    },
                }),
            ];

        case "ZeroDev":
            return [
                passkeyConnector({
                    bundlerUrl,
                    chain,
                    name: "OnChess",
                    passkeyServerUrl,
                    paymasterUrl,
                    rpcUrl,
                }),
            ];
    }
};

export const getConfig = (walletType: WalletProviderType, chain: Chain) => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    if (!rpcUrl) {
        throw new Error("Missing NEXT_PUBLIC_RPC_URL");
    }

    const connectors = getConnectors(walletType, chain, rpcUrl);
    const config = createConfig({
        chains: [chain],
        connectors,
        ssr: true,
        storage: createStorage({ storage: cookieStorage }),
        transports: {
            [chain.id]: http(rpcUrl),
        },
    });

    return config;
};
