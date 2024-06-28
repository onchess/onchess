"use client";
import { ActionIcon, Button, Group, Tooltip } from "@mantine/core";
import { Token } from "@onchess/core";
import { IconLogout } from "@tabler/icons-react";
import { FC } from "react";
import { Address } from "viem";
import { useEnsAvatar, useEnsName } from "wagmi";
import { ConnectedButton } from "./connect/ConnectedButton";

export type ConnectButtonProps = {
    address?: Address;
    balance?: string;
    isConnected: boolean;
    isConnecting: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    token?: Token;
};

export const ConnectButton: FC<ConnectButtonProps> = (props) => {
    const {
        address,
        balance,
        isConnecting,
        isConnected,
        onConnect,
        onDisconnect,
        token,
    } = props;
    const { data: ensName } = useEnsName({ address });
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

    return (
        <Group>
            {!isConnected && (
                <Button
                    disabled={isConnecting}
                    loading={isConnecting}
                    onClick={onConnect}
                >
                    Connect
                </Button>
            )}
            {address && token && (
                <ConnectedButton
                    address={address}
                    balance={balance}
                    ensAvatar={ensAvatar}
                    ensName={ensName}
                    loading={false}
                    token={token}
                />
            )}

            {isConnected && (
                <Tooltip label="Disconnect">
                    <ActionIcon
                        aria-label="Disconnect"
                        onClick={onDisconnect}
                        variant="subtle"
                        size="lg"
                        radius="lg"
                    >
                        <IconLogout
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                        />
                    </ActionIcon>
                </Tooltip>
            )}
        </Group>
    );
};
