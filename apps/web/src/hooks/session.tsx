"use client";

import { useEffect, useState } from "react";
import { parseEther, toFunctionSelector } from "viem";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useGrantPermissions } from "wagmi/experimental";
import { createCredential, P256Credential } from "webauthn-p256";
import { permissionCallableInputBoxAddress } from "./contracts";

type RequestPermissionsAsyncFunc = (expiry: number) => Promise<void>;

export const useSession = () => {
    const account = useAccount();
    const chainId = useChainId();
    const { data: walletClient, status } = useWalletClient();
    // const { supported } = usePermissionsSupport();
    const supported = true;
    const [requestPermissionsAsync, setRequestPermissionsAsync] =
        useState<RequestPermissionsAsyncFunc>(() => () => Promise.resolve());
    const [context, setContext] = useState<string | undefined>(undefined);
    const [credential, setCredential] = useState<
        undefined | P256Credential<"cryptokey">
    >();
    const [expiry, setExpiry] = useState<number>(0);
    const { grantPermissionsAsync } = useGrantPermissions();

    const requestPermissionsAsyncActive = async (
        expiry: number,
    ): Promise<void> => {
        if (account.address && walletClient) {
            const newCredential = await createCredential({ type: "cryptoKey" });
            const response = await grantPermissionsAsync({
                permissions: [
                    {
                        address: account.address,
                        chainId,
                        expiry,
                        signer: {
                            type: "key",
                            data: {
                                type: "secp256r1",
                                publicKey: newCredential.publicKey,
                            },
                        },
                        permissions: [
                            {
                                type: "native-token-recurring-allowance",
                                data: {
                                    allowance: parseEther("1"),
                                    start: Math.floor(Date.now() / 1000),
                                    period: 86400,
                                },
                            },
                            {
                                type: "allowed-contract-selector",
                                data: {
                                    contract: permissionCallableInputBoxAddress,
                                    selector: toFunctionSelector(
                                        "addInput(address,bytes)",
                                    ),
                                },
                            },
                        ],
                    },
                ],
            });
            if (response) {
                // set context from issued permission context
                const context = response[0].context;
                const permissions = response[0].permissions;
                setContext(context);
                setCredential(newCredential);
                setExpiry(permissions[0] ? permissions[0].expiry : expiry);
            }
        }
    };

    useEffect(() => {
        if (status == "success" && supported) {
            setRequestPermissionsAsync(() => requestPermissionsAsyncActive);
        }
    }, [status, supported]);

    return {
        context,
        credential,
        expiry,
        requestPermissionsAsync,
        supported,
    };
};
