import { inputBoxAbi, inputBoxAddress } from "@cartesi/viem/abi";
import { useEffect, useMemo, useState } from "react";
import { erc7715Actions } from "viem/experimental";
import { formatAbiItem, getAbiItem } from "viem/utils";
import { useWalletClient } from "wagmi";
import { usePermissionsSupport } from "./capabilities";

type RequestPermissionsAsyncFunc = (expiry: number) => Promise<void>;

export const useSessionId = () => {
    const { data: walletClient, status } = useWalletClient();
    const { supported } = usePermissionsSupport();
    const [requestPermissionsAsync, setRequestPermissionsAsync] =
        useState<RequestPermissionsAsyncFunc>(() => () => Promise.resolve());
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [expiry, setExpiry] = useState<number>(0);

    const requestPermissionsAsyncActive = useMemo(
        () =>
            async (expiry: number): Promise<void> => {
                if (walletClient) {
                    const extendedClient =
                        walletClient.extend(erc7715Actions());
                    const permissions = await extendedClient.grantPermissions({
                        expiry,
                        permissions: [
                            {
                                type: "contract-call",
                                data: {
                                    address: inputBoxAddress,
                                    calls: [
                                        formatAbiItem(
                                            getAbiItem({
                                                abi: inputBoxAbi,
                                                name: "addInput",
                                            }),
                                        ),
                                    ],
                                },
                                policies: [],
                            },
                        ],
                    });
                    if (permissions) {
                        // set session id from issued permission context
                        setSessionId(permissions.permissionsContext);
                        setExpiry(permissions.expiry);
                    }
                }
            },
        [walletClient],
    );

    useEffect(() => {
        if (status === "success" && supported) {
            setRequestPermissionsAsync(() => requestPermissionsAsyncActive);
        }
    }, [status, supported, requestPermissionsAsyncActive]);

    return { expiry, requestPermissionsAsync, sessionId, supported };
};
