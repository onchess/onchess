"use client";

import { ActionIcon, Anchor, Badge, Flex, Group, Text } from "@mantine/core";
import { Player, Token } from "@onchess/core";
import {
    IconBrandGithub,
    IconBrandX,
    IconChessBishopFilled,
    IconChessKingFilled,
    IconChessKnightFilled,
    IconChessQueenFilled,
    IconChessRookFilled,
} from "@tabler/icons-react";
import { FC } from "react";
import { formatUnits } from "viem";

export type HeaderProps = {
    address?: string;
    player?: Player;
    token: Token;
};

const chessIcons = [
    IconChessKingFilled,
    IconChessBishopFilled,
    IconChessKnightFilled,
    IconChessQueenFilled,
    IconChessRookFilled,
];

export const Header: FC<HeaderProps> = ({ player, token }) => {
    const { symbol } = token;
    const iconIndex = Math.min(
        Math.floor(Math.random() * chessIcons.length),
        chessIcons.length - 1,
    );
    const Icon = chessIcons[iconIndex];
    return (
        <Group justify="space-between" py={10} px={20}>
            <Group align="baseline">
                <Text ff="Cardo" fz={26}>
                    OnChess
                </Text>
            </Group>
            <Flex justify="flex-end" align="center" gap={5}>
                <w3m-button />
                {player && (
                    <Badge
                        size="xl"
                        h={40}
                        leftSection={<Icon color="white" size="1.5rem" />}
                    >
                        {formatUnits(BigInt(player.balance), 18)} {symbol}
                    </Badge>
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
