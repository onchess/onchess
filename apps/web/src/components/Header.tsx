import { Group } from "@mantine/core";
import { Player, Token } from "@onchess/core";
import { FC } from "react";
import { Address } from "viem";
import { getProviderType } from "../providers/wallet";
import { ConnectButton } from "./ConnectButton";
import { ColorSchemeToggle } from "./navigation/ColorSchemeToggle";
import { GitHubLink } from "./navigation/GitHubLink";
import { Menu } from "./navigation/Menu";
import { TwitterLink } from "./navigation/TwitterLink";

export type HeaderProps = {
    address?: Address;
    isConnected: boolean;
    isConnecting: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    player?: Player;
    token?: Token;
};

export const Header: FC<HeaderProps> = (props) => {
    const {
        address,
        isConnected,
        isConnecting,
        onConnect,
        onDisconnect,
        player,
        token,
    } = props;
    const provider = getProviderType();

    return (
        <Group justify="space-between" px={10}>
            <Group visibleFrom="sm" gap="xs">
                <Menu />
            </Group>
            {provider === "WalletConnect" && <w3m-button />}
            {provider === "ZeroDev" && (
                <ConnectButton
                    address={address}
                    balance={player?.balance}
                    isConnecting={isConnecting}
                    isConnected={isConnected}
                    onConnect={onConnect}
                    onDisconnect={onDisconnect}
                    token={token}
                />
            )}
            <ColorSchemeToggle />
            <Group visibleFrom="md" gap="xs">
                <GitHubLink />
                <TwitterLink />
            </Group>
        </Group>
    );
};
