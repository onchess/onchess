"use client";

import {
    ChainNotConfiguredError,
    Connector,
    createConnector,
} from "@wagmi/core";
import {
    PasskeyValidatorContractVersion,
    toPasskeyValidator,
    toWebAuthnKey,
    WebAuthnMode,
} from "@zerodev/passkey-validator";
import {
    createKernelAccount,
    createKernelAccountClient,
    KernelEIP1193Provider,
} from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { FC, PropsWithChildren } from "react";
import {
    AddEthereumChainParameter,
    createPublicClient,
    getAddress,
    numberToHex,
    ProviderRpcError,
    SwitchChainError,
    UserRejectedRequestError,
    type Chain,
} from "viem";
import { createPaymasterClient } from "viem/account-abstraction";
import { createConfig, http } from "wagmi";
import { BasicWalletProvider } from "./basic";

type PasskeyConnectorParameters = {
    projectId: string;
    chain: Chain;
    mode: WebAuthnMode;
    name: string;
    bundlerUrl: string;
    paymasterUrl?: string;
    passkeyServerUrl: string;
};

const ZERODEV_PASSKEY_URL = "https://passkeys.zerodev.app/api/v3";

const ZERODEV_BUNDLER_URL = "https://rpc.zerodev.app/api/v2/bundler";

const passkeyConnector = (parameters: PasskeyConnectorParameters) => {
    const { bundlerUrl, chain, mode, name, passkeyServerUrl, paymasterUrl } =
        parameters;
    let walletProvider: KernelEIP1193Provider | undefined;
    let accountsChanged: Connector["onAccountsChanged"] | undefined;
    let chainChanged: Connector["onChainChanged"] | undefined;
    let disconnect: Connector["onDisconnect"] | undefined;

    return createConnector<KernelEIP1193Provider | undefined>((config) => {
        return {
            id: "zerodevPasskeySDK",
            name: "Passkey",
            type: "passkeyConnector",
            async connect({ chainId } = {}) {
                try {
                    if (chainId && chain.id !== chainId) {
                        throw new Error(
                            `Incorrect chain Id: ${chainId} should be ${chain.id}`,
                        );
                    }

                    const provider = await this.getProvider({ chainId });
                    if (provider) {
                        const accounts = (
                            (await provider.request({
                                method: "eth_requestAccounts",
                            })) as string[]
                        ).map((x) => getAddress(x));
                        if (!accountsChanged) {
                            accountsChanged = this.onAccountsChanged.bind(this);
                            provider.on("accountsChanged", accountsChanged);
                        }
                        if (!chainChanged) {
                            chainChanged = this.onChainChanged.bind(this);
                            provider.on("chainChanged", chainChanged);
                        }
                        if (!disconnect) {
                            disconnect = this.onDisconnect.bind(this);
                            provider.on("disconnect", disconnect);
                        }
                        return { accounts, chainId: chain.id };
                    }

                    const webAuthnKey = await toWebAuthnKey({
                        passkeyName: name,
                        passkeyServerUrl,
                        mode,
                        passkeyServerHeaders: {},
                    });

                    const kernelVersion = KERNEL_V3_1;
                    const entryPoint = getEntryPoint("0.7");
                    const publicClient = createPublicClient({
                        chain,
                        transport: http(bundlerUrl), // XXX: pass URL (bundler or rpc?)
                    });

                    const passkeyValidator = await toPasskeyValidator(
                        publicClient,
                        {
                            entryPoint,
                            kernelVersion,
                            validatorContractVersion:
                                PasskeyValidatorContractVersion.V0_0_2,
                            webAuthnKey,
                        },
                    );

                    const kernelAccount = await createKernelAccount(
                        publicClient,
                        {
                            entryPoint,
                            kernelVersion,
                            plugins: {
                                sudo: passkeyValidator,
                            },
                        },
                    );

                    const kernelClient = createKernelAccountClient({
                        account: kernelAccount,
                        chain,
                        bundlerTransport: http(bundlerUrl),
                        paymaster: paymasterUrl
                            ? createPaymasterClient({
                                  transport: http(paymasterUrl),
                              })
                            : undefined,
                    });

                    walletProvider = new KernelEIP1193Provider(kernelClient);

                    return {
                        accounts: [kernelAccount.address],
                        chainId: chain.id,
                    };
                } catch (error) {
                    if (
                        /(user closed modal|accounts received is empty|user denied account)/i.test(
                            (error as Error).message,
                        )
                    )
                        throw new UserRejectedRequestError(error as Error);
                    throw error;
                }
            },

            async disconnect() {
                const provider = await this.getProvider();
                if (accountsChanged) {
                    provider?.removeListener(
                        "accountsChanged",
                        accountsChanged,
                    );
                    accountsChanged = undefined;
                }
                if (chainChanged) {
                    provider?.removeListener("chainChanged", chainChanged);
                    chainChanged = undefined;
                }
                if (disconnect) {
                    provider?.removeListener("disconnect", disconnect);
                    disconnect = undefined;
                }
                walletProvider = undefined;
                /* TODO: serialization, to it can be resumed after page reload */
                /*
                const serializedData = getZerodevSigner();
                if (serializedData) {
                    setZerodevSigner(serializedData.signer, false);
                }
                */
            },

            async getAccounts() {
                const provider = await this.getProvider();
                if (!provider) return [];

                const accounts = (await provider.request({
                    method: "eth_accounts",
                })) as string[];
                return accounts.map((a) => getAddress(a));
            },

            async getChainId() {
                const provider = await this.getProvider();
                if (!provider) return chain.id;

                const chainId = await provider.request({
                    method: "eth_chainId",
                });
                return Number(chainId as number);
            },

            async getProvider() {
                return walletProvider;
            },

            async isAuthorized() {
                try {
                    const accounts = await this.getAccounts();
                    return !!accounts.length;
                } catch {
                    return false;
                }
            },

            async switchChain({ addEthereumChainParameter, chainId }) {
                const chain = config.chains.find(
                    (chain) => chain.id === chainId,
                );
                if (!chain)
                    throw new SwitchChainError(new ChainNotConfiguredError());

                const provider = await this.getProvider();
                if (!provider)
                    throw new SwitchChainError(new Error("Not Connected"));

                try {
                    await provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: numberToHex(chain.id) }],
                    });
                    return chain;
                } catch (error) {
                    // Indicates chain is not added to provider
                    if ((error as ProviderRpcError).code === 4902) {
                        try {
                            let blockExplorerUrls: string[];
                            if (addEthereumChainParameter?.blockExplorerUrls)
                                blockExplorerUrls =
                                    addEthereumChainParameter.blockExplorerUrls;
                            else
                                blockExplorerUrls = chain.blockExplorers
                                    ?.default.url
                                    ? [chain.blockExplorers?.default.url]
                                    : [];

                            let rpcUrls: readonly string[];
                            if (addEthereumChainParameter?.rpcUrls?.length)
                                rpcUrls = addEthereumChainParameter.rpcUrls;
                            else
                                rpcUrls = [
                                    chain.rpcUrls.default?.http[0] ?? "",
                                ];

                            const addEthereumChain = {
                                blockExplorerUrls,
                                chainId: numberToHex(chainId),
                                chainName:
                                    addEthereumChainParameter?.chainName ??
                                    chain.name,
                                iconUrls: addEthereumChainParameter?.iconUrls,
                                nativeCurrency:
                                    addEthereumChainParameter?.nativeCurrency ??
                                    chain.nativeCurrency,
                                rpcUrls,
                            } satisfies AddEthereumChainParameter;

                            await provider.request({
                                method: "wallet_addEthereumChain",
                                params: [addEthereumChain],
                            });

                            return chain;
                        } catch (error) {
                            throw new UserRejectedRequestError(error as Error);
                        }
                    }

                    throw new SwitchChainError(error as Error);
                }
            },

            async onAccountsChanged(accounts) {
                if (accounts.length === 0) this.onDisconnect();
                else
                    config.emitter.emit("change", {
                        accounts: accounts.map((x) => getAddress(x)),
                    });
            },

            async onChainChanged(chain) {
                const chainId = Number(chain);
                config.emitter.emit("change", { chainId });
            },

            async onDisconnect(_error) {
                config.emitter.emit("disconnect");

                const provider = await this.getProvider();
                if (!provider) return;

                if (accountsChanged) {
                    provider.removeListener("accountsChanged", accountsChanged);
                    accountsChanged = undefined;
                }
                if (chainChanged) {
                    provider.removeListener("chainChanged", chainChanged);
                    chainChanged = undefined;
                }
                if (disconnect) {
                    provider.removeListener("disconnect", disconnect);
                    disconnect = undefined;
                }
                walletProvider = undefined;
                /* TODO: serialization, to it can be resumed after page reload */
                /*
                const serializedData = getZerodevSigner();
                if (serializedData) {
                    setZerodevSigner(serializedData.signer, false);
                }
                */
            },
        };
    });
};

export type ZeroDevWalletProviderProps = PropsWithChildren<{
    chain: Chain;
    projectId: string;
}>;

export const ZeroDevWalletProvider: FC<ZeroDevWalletProviderProps> = (
    props,
) => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL!;
    const { chain, projectId } = props;
    const bundlerUrl = `${ZERODEV_BUNDLER_URL}/${projectId}`;
    const paymasterUrl = "";
    const passkeyServerUrl = `${ZERODEV_PASSKEY_URL}/${projectId}`;
    const config = createConfig({
        chains: [chain],
        connectors: [
            passkeyConnector({
                bundlerUrl,
                chain,
                mode: WebAuthnMode.Login,
                name: "OnChess",
                passkeyServerUrl,
                paymasterUrl,
                projectId,
            }),
            passkeyConnector({
                bundlerUrl,
                chain,
                mode: WebAuthnMode.Register,
                name: "OnChess",
                passkeyServerUrl,
                paymasterUrl,
                projectId,
            }),
        ],
        ssr: true,
        transports: {
            [chain.id]: http(rpcUrl),
        },
    });
    return <BasicWalletProvider {...props} config={config} />;
};
