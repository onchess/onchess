"use client";

import {
    Alert,
    Button,
    Group,
    NativeSelect,
    Paper,
    type PaperProps,
    Stack,
    Text,
    Textarea,
} from "@mantine/core";
import {
    type CreateGamePayload,
    INITIAL_RATING,
    type Player,
    type Token,
} from "@onchess/core";
import { IconClock, IconCoin, IconStar } from "@tabler/icons-react";
import { type FC, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { formatTimeControl } from "../util/format";

export interface CreateGameProps extends PaperProps {
    error?: string;
    player?: Player;
    executing: boolean;
    onConnect?: () => void;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
    onDeposit?: (amount: string) => void;
    token: Token;
}

export const timeControls = ["604800", "2419200"];

export const CreateGame: FC<CreateGameProps> = (props) => {
    const {
        executing,
        error,
        onConnect,
        onCreate,
        onDeposit,
        player,
        token,
        ...otherProps
    } = props;
    const { decimals } = token;

    // player balance
    const balance = player ? BigInt(player.balance) : undefined;

    // possible bets
    const bets = ["0", "0.5", "1", "5"].map((v) => parseUnits(v, decimals));
    const betFormat = (value: bigint) =>
        value === 0n
            ? "No bet"
            : `${formatUnits(value, decimals)} ${token.symbol}`;

    // bet
    const [bet, setBet] = useState(bets[1].toString());

    // supported time controls
    const [timeControl, setTimeControl] = useState(timeControls[0]);

    // opponent rating
    const playerRating = player ? player.rating : INITIAL_RATING;
    const step = 50;
    const defaultRangeSteps = 10;
    const ratings = Array.from({ length: 3000 / step + 1 }, (_, i) => i * step);
    const playerRoundedRating = Math.round(playerRating / step) * step;
    const initialMinRating = Math.max(
        0,
        playerRoundedRating - (defaultRangeSteps / 2) * step,
    );
    const initialMaxRating = Math.min(
        3000,
        playerRoundedRating + (defaultRangeSteps / 2) * step,
    );
    const [minRating, setMinRating] = useState(initialMinRating);
    const [maxRating, setMaxRating] = useState(initialMaxRating);

    const insufficientBalance =
        player && balance !== undefined && BigInt(bet) > balance;

    return (
        <Paper {...otherProps} p={20} withBorder shadow="md">
            <Stack justify="space-between" h="100%">
                <Group justify="space-between">
                    <Group gap={5}>
                        <IconCoin size={16} />
                        <Text fw={800}>Bet</Text>
                    </Group>
                    <NativeSelect
                        data={bets.map((v) => ({
                            value: v.toString(),
                            label: betFormat(v),
                        }))}
                        onChange={(event) => setBet(event.target.value)}
                        value={bet}
                        error={insufficientBalance && "Insufficient balance"}
                    />
                </Group>
                <Group justify="space-between">
                    <Group gap={5}>
                        <IconClock size={16} />
                        <Text fw={800}>Time Control</Text>
                    </Group>
                    <NativeSelect
                        data={timeControls.map((value) => ({
                            value,
                            label: formatTimeControl(value),
                        }))}
                        onChange={(event) => setTimeControl(event.target.value)}
                        value={timeControl}
                    />
                </Group>
                <Group justify="space-between">
                    <Group gap={5}>
                        <IconStar size={16} />
                        <Text fw={800}>Opponent</Text>
                    </Group>
                    <Group gap={5}>
                        <NativeSelect
                            name="minRating"
                            data={ratings.map((value) => ({
                                value: value.toString(),
                                label: value.toString(),
                            }))}
                            value={minRating.toString()}
                            onChange={(event) => {
                                const value = Number(event.target.value);
                                setMinRating(value);
                                setMaxRating(
                                    Math.max(
                                        Math.min(value + step, 3000),
                                        maxRating,
                                    ),
                                );
                            }}
                        />
                        <Text>to</Text>
                        <NativeSelect
                            name="maxRating"
                            data={ratings.map((value) => ({
                                value: value.toString(),
                                label: value.toString(),
                            }))}
                            value={maxRating.toString()}
                            onChange={(event) => {
                                const value = Number(event.target.value);
                                setMaxRating(value);
                                setMinRating(
                                    Math.min(
                                        Math.max(value - step, 0),
                                        minRating,
                                    ),
                                );
                            }}
                        />
                    </Group>
                </Group>
                {error && (
                    <Alert color="red" title="Error">
                        <Textarea
                            readOnly
                            rows={5}
                            value={error}
                            variant="unstyled"
                        />
                    </Alert>
                )}
                {player && balance !== undefined && BigInt(bet) <= balance && (
                    <Button
                        loading={executing}
                        onClick={() => {
                            onCreate({
                                bet,
                                timeControl,
                                minRating,
                                maxRating,
                            });
                        }}
                    >
                        Create Game
                    </Button>
                )}
                {insufficientBalance && (
                    <Group justify="space-evenly" grow>
                        <Button onClick={() => onDeposit?.(bet)}>
                            Deposit
                        </Button>
                    </Group>
                )}
                {!player && (
                    <Button onClick={onConnect} loading={executing}>
                        Connect
                    </Button>
                )}
            </Stack>
        </Paper>
    );
};
