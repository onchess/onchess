import { SimpleGrid, Stack, type StackProps } from "@mantine/core";
import type { Player } from "@onchess/core";
import type { FC } from "react";
import type { Address } from "viem";
import { LeaderboardPlayer } from "./LeaderboardPlayer";

export interface LeaderboardProps extends StackProps {
    account?: Address;
    players: Record<string, Player>;
}

export const Leaderboard: FC<LeaderboardProps> = (props) => {
    const { account, players } = props;
    const sorted = Object.keys(players).sort((p1, p2) => {
        const pp1 = players[p1];
        const pp2 = players[p2];
        return pp2.rating - pp1.rating;
    });
    return (
        <Stack {...props}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                {sorted.map((player, index) => (
                    <LeaderboardPlayer
                        key={player}
                        account={account}
                        address={player}
                        player={players[player]}
                        position={index + 1}
                    />
                ))}
            </SimpleGrid>
        </Stack>
    );
};
