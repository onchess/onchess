import {
    Center,
    Divider,
    Flex,
    Group,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import type { Player } from "@onchess/core";
import type { FC } from "react";
import type { Address } from "viem";
import { AddressText } from "./AddressText";

export type LeaderboardPlayerProps = {
    account?: Address;
    address: string;
    player: Player;
    position: number;
};

export const LeaderboardPlayer: FC<LeaderboardPlayerProps> = ({
    account,
    address,
    player,
    position,
}) => {
    const me = address === account;
    const { games, wins, losses, draws } = player;

    return (
        <Paper
            withBorder
            bg={me ? "var(--mantine-primary-color-light)" : undefined}
        >
            <Flex gap={5}>
                <Center w={40}>
                    <Text ff="monospace">{position}</Text>
                </Center>
                <Divider orientation="vertical" />
                <Stack gap={5} p={10}>
                    <Group gap={2}>
                        <AddressText
                            address={address as Address}
                            ff="monospace"
                            fw={800}
                        />
                        <Text>({player.rating})</Text>
                    </Group>
                    <Text>
                        {`${games} ${games === 1 ? "game" : "games"} (${wins} W / ${losses} L / ${draws} D)`}
                    </Text>
                </Stack>
            </Flex>
        </Paper>
    );
};
