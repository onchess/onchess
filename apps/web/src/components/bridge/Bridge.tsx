"use client";
import {
    Alert,
    Avatar,
    Center,
    Grid,
    Group,
    SegmentedControl,
    Stack,
    type StackProps,
    Text,
    Textarea,
} from "@mantine/core";
import type { Token } from "@onchess/core";
import { IconArrowRight } from "@tabler/icons-react";
import { type FC, useState } from "react";
import type { Chain } from "viem";
import type { ExecutableVoucher } from "../../hooks/voucher";
import { Faucet } from "../Faucet";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";

export interface BridgeProps extends StackProps {
    allowance?: string;
    applicationBalance?: string;
    balance?: string;
    chain: Chain;
    connecting: boolean;
    disabled: boolean;
    error?: string;
    executing: boolean;
    initialDepositAmount: string | undefined | null;
    initialWithdrawAmount: string | undefined | null;
    onApprove?: (amount: string) => void;
    onApproveAndDeposit?: (amount: string) => void;
    onConnect: () => void;
    onDeposit?: (amount: string) => void;
    onExecuteVoucher: (voucher: ExecutableVoucher) => void;
    onWithdraw: (amount: string) => void;
    token: Token;
    vouchers: ExecutableVoucher[];
}

export const Bridge: FC<BridgeProps> = (props) => {
    const {
        allowance,
        applicationBalance,
        balance,
        chain,
        connecting,
        disabled,
        error,
        executing,
        initialDepositAmount,
        initialWithdrawAmount,
        onApprove,
        onApproveAndDeposit,
        onConnect,
        onDeposit,
        onExecuteVoucher,
        onWithdraw,
        token,
        vouchers,
        ...stackProps
    } = props;
    const [operation, setOperation] = useState(
        initialWithdrawAmount ? "withdraw" : "deposit",
    );

    return (
        <Stack {...stackProps}>
            {chain.testnet && <Faucet />}
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
                <Grid>
                    <Grid.Col span={5}>
                        <Group gap={5} justify="flex-start">
                            <Avatar src="/img/base_icon.svg" size="md" />
                            <Stack gap={0} align="flex-start">
                                <Text size="sm">From</Text>
                                <Text size="sm" fw={800}>
                                    {chain.name}
                                </Text>
                            </Stack>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Center>
                            <IconArrowRight size={30} />
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={5}>
                        <Group gap={5} justify="flex-end">
                            <Stack gap={0} align="flex-end">
                                <Text size="sm">To</Text>
                                <Text size="sm" fw={800}>
                                    OnChess
                                </Text>
                            </Stack>
                            <Avatar src="/img/onchess_logo.png" size="md" />
                        </Group>
                    </Grid.Col>
                </Grid>
            )}
            {operation === "withdraw" && (
                <Grid>
                    <Grid.Col span={5}>
                        <Group gap={5} justify="flex-start">
                            <Avatar src="/img/onchess_logo.png" size="md" />
                            <Stack gap={0} align="flex-start">
                                <Text size="sm">From</Text>
                                <Text size="sm" fw={800}>
                                    OnChess
                                </Text>
                            </Stack>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={2}>
                        <Center>
                            <IconArrowRight size={30} />
                        </Center>
                    </Grid.Col>
                    <Grid.Col span={5}>
                        <Group gap={5} justify="flex-end">
                            <Stack gap={0} align="flex-end">
                                <Text size="sm">To</Text>
                                <Text size="sm" fw={800}>
                                    {chain.name}
                                </Text>
                            </Stack>
                            <Avatar src="/img/base_icon.svg" size="md" />
                        </Group>
                    </Grid.Col>
                </Grid>
            )}

            {operation === "deposit" && (
                <Deposit
                    allowance={allowance}
                    balance={balance}
                    connecting={connecting}
                    disabled={disabled}
                    executing={executing}
                    initialAmount={initialDepositAmount}
                    token={token}
                    onApprove={onApprove}
                    onApproveAndDeposit={onApproveAndDeposit}
                    onConnect={onConnect}
                    onDeposit={onDeposit}
                />
            )}
            {operation === "withdraw" && (
                <Withdraw
                    applicationBalance={applicationBalance}
                    connecting={connecting}
                    disabled={disabled}
                    executing={executing}
                    initialAmount={initialWithdrawAmount}
                    onConnect={onConnect}
                    onExecuteVoucher={onExecuteVoucher}
                    onWithdraw={onWithdraw}
                    token={token}
                    vouchers={vouchers}
                />
            )}
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
        </Stack>
    );
};
