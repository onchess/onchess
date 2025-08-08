import {
    Button,
    Group,
    Paper,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import type {
    Challenge,
    ChallengeBasePayload,
    Player,
    Token,
} from "@onchess/core";
import { IconChess, IconClock, IconCoin, IconStar } from "@tabler/icons-react";
import type { FC } from "react";
import { formatUnits } from "viem";
import { formatTimeControl } from "../../util/format";
import { AddressText } from "../AddressText";

interface ChallengeProps {
    executing: boolean;
    challenge: Challenge;
    challenger: Player;
    onCancel: (params: Omit<ChallengeBasePayload, "metadata">) => void;
    onJoin: (params: Omit<ChallengeBasePayload, "metadata">) => void;
    player?: Player;
    token: Token;
}

export const ChallengeComponent: FC<ChallengeProps> = ({
    executing,
    challenge,
    challenger,
    onCancel,
    onJoin,
    player,
    token,
}) => {
    const requiredRating =
        challenge.minRating > 0 && challenge.maxRating < Number.MAX_SAFE_INTEGER
            ? `From ${challenge.minRating} up to ${challenge.maxRating}`
            : challenge.minRating > 0 &&
                challenge.maxRating === Number.MAX_SAFE_INTEGER
              ? `From ${challenge.minRating}`
              : challenge.minRating === 0 &&
                  challenge.maxRating < Number.MAX_SAFE_INTEGER
                ? `Up to ${challenge.maxRating}`
                : "Any";

    const inRatingRange =
        player &&
        player.rating >= challenge.minRating &&
        player.rating <= challenge.maxRating;
    const hasEnoughBalance =
        player && BigInt(player.balance) >= BigInt(challenge.bet);
    const isSelf = player && player.address === challenge.player;
    const canJoin = !isSelf && inRatingRange && hasEnoughBalance && !executing;

    const betFormat = (value: bigint) =>
        value === 0n
            ? "No bet"
            : `${formatUnits(value, token.decimals)} ${token.symbol}`;

    // use a different background shade for player's own challenge
    const theme = useMantineTheme();
    const bg = isSelf ? theme.colors[theme.primaryColor][0] : undefined;

    return (
        <Paper p={20} withBorder shadow="md" bg={bg}>
            <Stack justify="space-between" h="100%">
                {!isSelf && (
                    <Group justify="space-between">
                        <Group gap={5}>
                            <IconChess size={16} />
                            <Text fw={800}>Player</Text>
                        </Group>
                        <Group gap={2}>
                            <AddressText address={challenge.player} />
                            <Text>({challenger.rating})</Text>
                        </Group>
                    </Group>
                )}
                {isSelf && (
                    <Group justify="space-between">
                        <Group gap={5}>
                            <IconChess size={16} />
                            <Text fw={800}>Waiting for opponent...</Text>
                        </Group>
                    </Group>
                )}
                <Group justify="space-between">
                    <Group gap={5}>
                        <IconCoin size={16} />
                        <Text fw={800}>Bet</Text>
                    </Group>
                    <Text c={hasEnoughBalance ? undefined : "red"}>
                        {betFormat(BigInt(challenge.bet))}
                    </Text>
                </Group>
                <Group justify="space-between">
                    <Group gap={5}>
                        <IconClock size={16} />
                        <Text fw={800}>Time Control</Text>
                    </Group>
                    <Text>{formatTimeControl(challenge.timeControl)}</Text>
                </Group>
                <Group justify="space-between">
                    <Group gap={5}>
                        <IconStar size={16} />
                        <Text fw={800}>Opponent</Text>
                    </Group>
                    <Text c={inRatingRange ? undefined : "red"}>
                        {requiredRating}
                    </Text>
                </Group>
                {isSelf && (
                    <Button
                        onClick={() => onCancel({ address: challenge.address })}
                        loading={executing}
                    >
                        Cancel
                    </Button>
                )}
                {!isSelf && (
                    <Button
                        onClick={() => onJoin({ address: challenge.address })}
                        disabled={!canJoin}
                        loading={executing}
                    >
                        Join Game
                    </Button>
                )}
            </Stack>
        </Paper>
    );
};
