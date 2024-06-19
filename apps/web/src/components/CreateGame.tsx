"use client";

import {
    Button,
    Group,
    Paper,
    PaperProps,
    RangeSlider,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import {
    CreateGamePayload,
    INITIAL_RATING,
    Player,
    parseTimeControl,
} from "@onchess/core";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import humanizeDuration from "humanize-duration";
import { FC, useState } from "react";
import { formatUnits, parseUnits } from "viem";

export interface CreateGameProps extends PaperProps {
    player?: Player;
    decimals: number;
    symbol: string;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
}

export const timeControls = ["1500", "2700", "1500+10", "2700+10"];

export const CreateGame: FC<CreateGameProps> = (props) => {
    const { decimals, onCreate, player, symbol, ...otherProps } = props;

    // player balance
    const balance = player ? BigInt(player.balance) : undefined;

    // possible bets
    const bets = ["0.5", "1", "5"].map((v) => parseUnits(v, decimals));
    const betFormat = (value: bigint) => (
        <Text>
            {formatUnits(value, decimals)} {symbol}
        </Text>
    );
    const timeControlFormat = (value: string): string => {
        const parsed = parseTimeControl(value);
        if (parsed) {
            if (parsed[1] > 0) {
                return `${humanizeDuration(parsed[0] * 1000)} per player + ${humanizeDuration(parsed[1] * 1000)} per move`;
            } else {
                return `${humanizeDuration(parsed[0] * 1000)} per player`;
            }
        } else {
            return "Unsupported time control";
        }
    };

    // bet
    const [bet, setBet] = useState(bets[0].toString());

    // supported time controls
    const [timeControl, setTimeControl] = useState(timeControls[0]);
    const timeControlMessage = timeControlFormat(timeControl);

    // opponent rating
    const playerRating = player ? player.rating : INITIAL_RATING;
    const minRating = Math.max(0, playerRating - 300);
    const maxRating = Math.min(3000, playerRating + 300);
    const [rating, setRating] = useState<[number, number]>([
        minRating,
        maxRating,
    ]);

    const { open } = useWeb3Modal();

    return (
        <Paper
            {...otherProps}
            h="100%"
            p={20}
            withBorder
            shadow="md"
            bg="var(--mantine-primary-color-light)"
        >
            <Stack justify="space-around" h="100%" gap={30}>
                <Stack gap={2}>
                    <Text fw={800}>Bet</Text>
                    <SegmentedControl
                        value={bet}
                        onChange={setBet}
                        data={bets.map((v) => ({
                            value: v.toString(),
                            label: betFormat(v),
                        }))}
                    />
                </Stack>
                <Stack gap={2}>
                    <Text fw={800}>Time Control</Text>
                    <SegmentedControl
                        value={timeControl}
                        onChange={setTimeControl}
                        data={timeControls}
                    />
                    <Text>{timeControlMessage}</Text>
                </Stack>
                <Stack gap={2}>
                    <Text fw={800}>Opponent Rating</Text>
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
                <Group>
                    {player &&
                        balance !== undefined &&
                        BigInt(bet) <= balance && (
                            <Button
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
                            <Button disabled>Insufficient balance</Button>
                        )}
                    {!player && <Button onClick={() => open()}>Connect</Button>}
                </Group>
            </Stack>
        </Paper>
    );
};
