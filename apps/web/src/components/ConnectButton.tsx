"use client";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import type { Token } from "@onchess/core";
import { IconLogout } from "@tabler/icons-react";
import type { FC } from "react";
import type { Address } from "viem";
import { useEnsAvatar, useEnsName } from "wagmi";
import { ConnectedButton } from "./connect/ConnectedButton";

export type ConnectButtonProps = {
    address?: Address;
    balance?: string;
    isConnected: boolean;
    isConnecting: boolean;
    onConnect: () => void;
    onLogin?: () => void;
    onRegister?: () => void;
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
        onLogin,
        onRegister,
        onDisconnect,
        token,
    } = props;
    const { data: ensName } = useEnsName({ address });
    const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined });

    return (
        <>
            {!isConnected &&
                (onLogin && onRegister ? (
                    <>
                        <Button
                            disabled={isConnecting}
                            loading={isConnecting}
                            onClick={onRegister}
                        >
                            Signup
                        </Button>
                        <Button
                            disabled={isConnecting}
                            loading={isConnecting}
                            onClick={onLogin}
                        >
                            Login
                        </Button>
                    </>
                ) : (
                    <Button
                        disabled={isConnecting}
                        loading={isConnecting}
                        onClick={onConnect}
                    >
                        Connect
                    </Button>
                ))}
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
        </>
    );
};
