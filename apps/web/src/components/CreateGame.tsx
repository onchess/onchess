"use client";

import {
    Button,
    Group,
    Paper,
    PaperProps,
    SegmentedControl,
    Stack,
    Text,
} from "@mantine/core";
import {
    CreateGamePayload,
    DepositPayload,
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
    onDeposit: (params: Omit<DepositPayload, "metadata" | "sender">) => void;
}

export const timeControls = ["1500", "2700", "1500+10", "2700+10"];

export const CreateGame: FC<CreateGameProps> = (props) => {
    const { decimals, onCreate, onDeposit, player, symbol, ...otherProps } =
        props;

    // player balance
    const balance = player ? BigInt(player.balance) : undefined;

    // possible bets
    const bets = ["10", "100", "1000"].map((v) => parseUnits(v, decimals));
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
            <Stack justify="space-around" h="100%">
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
                <Group>
                    {player &&
                        balance !== undefined &&
                        BigInt(bet) <= balance && (
                            <Button
                                onClick={() => {
                                    onCreate({
                                        bet,
                                        timeControl,
                                        minRating: 0,
                                        maxRating: Number.MAX_SAFE_INTEGER,
                                    });
                                }}
                            >
                                Play
                            </Button>
                        )}
                    {player &&
                        balance !== undefined &&
                        BigInt(bet) > balance && (
                            <Button
                                onClick={() => {
                                    onDeposit({ amount: bet });
                                }}
                            >
                                Deposit
                            </Button>
                        )}
                    {!player && <Button onClick={() => open()}>Connect</Button>}
                </Group>
            </Stack>
        </Paper>
    );
};
