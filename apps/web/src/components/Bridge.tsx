import {
    Avatar,
    Center,
    Grid,
    Group,
    Paper,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Token } from "@onchess/core";
import {
    IconSquareArrowLeftFilled,
    IconSquareArrowRightFilled,
} from "@tabler/icons-react";
import { FC, useState } from "react";
import { formatUnits } from "viem";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";

export interface BridgeProps {
    allowance: string;
    applicationBalance: string;
    balance: string;
    disabled: boolean;
    executing: boolean;
    onApprove: (amount: string) => void;
    onDeposit: (amount: string) => void;
    onWithdraw: (amount: string) => void;
    token: Token;
}

export const Bridge: FC<BridgeProps> = (props) => {
    const { decimals, symbol } = props.token;

    const balance = BigInt(props.balance);
    const applicationBalance = BigInt(props.applicationBalance);

    const [operation, setOperation] = useState("deposit");

    return (
        <Grid>
            <Grid.Col span={3}>
                <Paper p={20} withBorder h="100%">
                    <Group gap={30} justify="space-between">
                        <Stack gap={0}>
                            <Text>Balance</Text>
                            <Group gap={3} align="baseline">
                                <Title order={2}>
                                    {formatUnits(balance, decimals)}
                                </Title>
                                <Text size="sm">{symbol}</Text>
                            </Group>
                        </Stack>
                        <Avatar src="/img/base_icon.svg" size="md" />
                    </Group>
                </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
                <Stack>
                    <SegmentedControl
                        data={[
                            { label: "Deposit", value: "deposit" },
                            { label: "Withdraw", value: "withdraw" },
                        ]}
                        value={operation}
                        onChange={setOperation}
                        w="100%"
                    />
                    {operation === "deposit" && (
                        <SimpleGrid cols={2}>
                            <Deposit {...props} />
                            <Center>
                                <IconSquareArrowRightFilled
                                    color="lightgray"
                                    size={50}
                                />
                            </Center>
                        </SimpleGrid>
                    )}
                    {operation === "withdraw" && (
                        <SimpleGrid cols={2}>
                            <Center>
                                <IconSquareArrowLeftFilled
                                    color="lightgray"
                                    size={50}
                                />
                            </Center>
                            <Withdraw {...props} />
                        </SimpleGrid>
                    )}
                </Stack>
            </Grid.Col>
            <Grid.Col span={3}>
                <Paper p={20} withBorder h="100%">
                    <Group gap={30} justify="space-between">
                        <Stack gap={0}>
                            <Text>Balance</Text>
                            <Group gap={3} align="baseline">
                                <Title order={2}>
                                    {formatUnits(applicationBalance, decimals)}
                                </Title>
                                <Text size="sm">{symbol}</Text>
                            </Group>
                        </Stack>
                        <Avatar src="/img/onchess_logo.png" size="md" />
                    </Group>
                </Paper>
            </Grid.Col>
        </Grid>
    );
};
