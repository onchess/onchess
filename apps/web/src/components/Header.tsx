"use client";

import {
    ActionIcon,
    Anchor,
    Flex,
    Group,
    Image,
    Text,
    em,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Player, Token } from "@onchess/core";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { FC } from "react";
import { Address } from "viem";
import { getProviderType } from "../providers/wallet";
import { ConnectButton } from "./ConnectButton";

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

    const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

    return (
        <Group justify="space-between" py={10} px={20}>
            <Group gap={5}>
                <Image src="/img/onchess_logo.png" h={40} />
                {!isMobile && (
                    <Text ff="Cardo" fz={26}>
                        OnChess
                    </Text>
                )}
            </Group>
            <Flex justify="flex-end" align="center" gap={5}>
                {provider === "WalletConnect" && <w3m-button />}
                {token && provider === "ZeroDev" && (
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
                <Anchor href="https://github.com/onchess" target="_blank">
                    <ActionIcon
                        size="lg"
                        color="gray"
                        variant="subtle"
                        radius="lg"
                    >
                        <IconBrandGithub
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                        />
                    </ActionIcon>
                </Anchor>
                <Anchor href="https://x.com/OnChessProject" target="_blank">
                    <ActionIcon
                        size="lg"
                        color="gray"
                        variant="subtle"
                        radius="lg"
                    >
                        <IconBrandX
                            style={{ width: "70%", height: "70%" }}
                            stroke={1.5}
                        />
                    </ActionIcon>
                </Anchor>
            </Flex>
        </Group>
    );
};
