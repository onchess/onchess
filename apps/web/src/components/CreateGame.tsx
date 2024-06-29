"use client";

import {
    Alert,
    Button,
    Center,
    Group,
    Paper,
    PaperProps,
    RangeSlider,
    SegmentedControl,
    Stack,
    Text,
    Textarea,
    em,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
    CreateGamePayload,
    INITIAL_RATING,
    Player,
    Token,
} from "@onchess/core";
import { IconClock, IconCoin, IconStar } from "@tabler/icons-react";
import { FC, useState } from "react";
import { parseUnits } from "viem";
import { formatTimeControl } from "../util/format";
import { Balance } from "./connect/Balance";

export interface CreateGameProps extends PaperProps {
    error?: string;
    player?: Player;
    executing: boolean;
    onConnect?: () => void;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
    onDeposit?: (amount: string) => void;
    token: Token;
}

export const timeControls = ["1500", "2700", "1500+10", "2700+10"];

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
    const { decimals, symbol } = token;

    // player balance
    const balance = player ? BigInt(player.balance) : undefined;

    // possible bets
    const bets = ["0.5", "1", "5"].map((v) => parseUnits(v, decimals));
    const betFormat = (value: bigint) => (
        <Center p="sm">
            <Balance
                token={token}
                balance={value.toString()}
                iconPosition="left"
                variant="transparent"
            />
        </Center>
    );

    // bet
    const [bet, setBet] = useState(bets[0].toString());

    // supported time controls
    const [timeControl, setTimeControl] = useState(timeControls[0]);

    // opponent rating
    const playerRating = player ? player.rating : INITIAL_RATING;
    const minRating = Math.max(0, playerRating - 300);
    const maxRating = Math.min(3000, playerRating + 300);
    const [rating, setRating] = useState<[number, number]>([
        minRating,
        maxRating,
    ]);

    const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

    return (
        <Paper {...otherProps} p={20} withBorder>
            <Stack justify="space-around" gap={30}>
                <Stack gap={5}>
                    <Group gap={5}>
                        <IconCoin size={16} />
                        <Text fw={800}>Bet</Text>
                    </Group>
                    <SegmentedControl
                        data={bets.map((v) => ({
                            value: v.toString(),
                            label: betFormat(v),
                        }))}
                        fullWidth
                        onChange={setBet}
                        orientation={isMobile ? "vertical" : "horizontal"}
                        value={bet}
                    />
                </Stack>
                <Stack gap={5}>
                    <Group gap={5}>
                        <IconClock size={16} />
                        <Text fw={800}>Time Control</Text>
                    </Group>
                    <SegmentedControl
                        data={timeControls.map((value) => ({
                            value,
                            label: (
                                <Text p="sm">{formatTimeControl(value)}</Text>
                            ),
                        }))}
                        fullWidth
                        onChange={setTimeControl}
                        orientation={isMobile ? "vertical" : "horizontal"}
                        value={timeControl}
                    />
                </Stack>
                <Stack gap={5}>
                    <Group gap={5}>
                        <IconStar size={16} />
                        <Text fw={800}>Opponent Rating</Text>
                    </Group>
                    <RangeSlider
                        mt={40}
                        min={0}
                        max={3000}
                        minRange={200}
                        precision={0}
                        step={10}
                        value={rating}
                        onChange={setRating}
                        labelAlwaysOn
                    />
                </Stack>
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
                <Group>
                    {player &&
                        balance !== undefined &&
                        BigInt(bet) <= balance && (
                            <Button
                                loading={executing}
                                onClick={() => {
                                    onCreate({
                                        bet,
                                        timeControl,
                                        minRating: rating[0],
                                        maxRating: rating[1],
                                    });
                                }}
                            >
                                Play
                            </Button>
                        )}
                    {player &&
                        balance !== undefined &&
                        BigInt(bet) > balance && (
                            <>
                                <Button disabled>Insufficient balance</Button>
                                <Button onClick={() => onDeposit?.(bet)}>
                                    Deposit
                                </Button>
                            </>
                        )}
                    {!player && (
                        <Button onClick={onConnect} loading={executing}>
                            Connect
                        </Button>
                    )}
                </Group>
            </Stack>
        </Paper>
    );
};
