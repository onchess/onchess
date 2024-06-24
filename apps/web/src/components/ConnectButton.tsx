"use client";
import { Button, Group, Text } from "@mantine/core";
import { FC } from "react";
import {
    useAccount,
    useConnect,
    useConnectors,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
} from "wagmi";

export const ConnectButton: FC = () => {
    const connectors = useConnectors();
    const { connect, isPending } = useConnect();
    const { address, isConnected } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
    const { disconnect } = useDisconnect();
    return (
        <Group>
            {!isConnected ? (
                connectors
                    .filter((c) => c.type !== "injected")
                    .map((connector, index) => (
                        <Button
                            key={index}
                            disabled={isPending}
                            onClick={() => {
                                connect({ connector });
                            }}
                        >
                            {isPending ? "Connecting..." : connector.name}
                        </Button>
                    ))
            ) : (
                <Group>
                    <Text>{address}</Text>
                    <Button onClick={() => disconnect()}>Disconnect</Button>
                </Group>
            )}
        </Group>
    );
};
