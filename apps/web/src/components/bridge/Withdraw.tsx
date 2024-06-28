"use client";
import {
    Badge,
    Button,
    Collapse,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Token } from "@onchess/core";
import {
    IconChevronDown,
    IconChevronUp,
    IconCornerLeftUp,
} from "@tabler/icons-react";
import { FC } from "react";
import { formatUnits, parseUnits } from "viem";
import { ExecutableVoucher } from "../../hooks/voucher";
import { Vouchers } from "./Vouchers";

export interface WithdrawProps {
    applicationBalance: string;
    disabled: boolean;
    executing: boolean;
    initialAmount: string | undefined | null;
    onExecuteVoucher: (voucher: ExecutableVoucher) => void;
    onWithdraw: (amount: string) => void;
    token: Token;
    vouchers: ExecutableVoucher[];
}

export const Withdraw: FC<WithdrawProps> = (props) => {
    const {
        disabled,
        executing,
        initialAmount,
        onExecuteVoucher,
        onWithdraw,
        token,
        vouchers,
    } = props;
    const { decimals, symbol } = token;

    const form = useForm({
        initialValues: {
            amount: initialAmount
                ? formatUnits(BigInt(initialAmount), decimals)
                : "",
        },
        transformValues: ({ amount }) => {
            let parsed = 0n;
            try {
                parsed = parseUnits(amount, decimals);
            } catch {}
            return {
                amount: parsed,
            };
        },
        validate: {
            amount: (value) => {
                try {
                    parseUnits(value, decimals);
                    return null;
                } catch {
                    return "Invalid amount";
                }
            },
        },
        validateInputOnChange: true,
    });

    const applicationBalance = BigInt(props.applicationBalance);
    const { amount } = form.getTransformedValues();

    const waitAmount = applicationBalance > 0n && amount <= 0n;
    const insufficientBalance =
        applicationBalance < amount || applicationBalance === 0n;
    const canWithdraw = amount > 0n && applicationBalance >= amount;

    // voucher management
    const [opened, { toggle }] = useDisclosure(false);

    return (
        <Stack>
            <Paper p={20} radius="md" bg="gray.1">
                <Stack gap={0}>
                    <TextInput
                        label="Withdraw"
                        key={form.key("amount")}
                        {...form.getInputProps("amount")}
                        rightSection={
                            <Badge size="lg" variant="white">
                                {symbol}
                            </Badge>
                        }
                        placeholder="0"
                        size="xxl"
                        variant="unstyled"
                    />
                    <Group justify="flex-end" gap={3}>
                        <Text size="xs">{`${formatUnits(applicationBalance, decimals)} ${symbol} available`}</Text>
                        <Button
                            disabled={disabled || applicationBalance <= 0n}
                            size="compact-xs"
                            variant="transparent"
                            onClick={() =>
                                form.setFieldValue(
                                    "amount",
                                    formatUnits(applicationBalance, decimals),
                                )
                            }
                        >
                            <Group gap={0}>
                                <IconCornerLeftUp
                                    color={
                                        disabled || applicationBalance <= 0n
                                            ? "lightgray"
                                            : "blue"
                                    }
                                    size={12}
                                />
                                <Text size="xs">max</Text>
                            </Group>
                        </Button>
                    </Group>
                </Stack>
            </Paper>
            {waitAmount && <Button disabled>Enter amount</Button>}
            {insufficientBalance && (
                <Button disabled>Insufficient balance</Button>
            )}
            {canWithdraw && (
                <Button
                    loading={executing}
                    disabled={disabled}
                    onClick={() => onWithdraw(amount.toString())}
                >
                    Withdraw
                </Button>
            )}
            {vouchers.length > 0 && (
                <>
                    <Button
                        variant="transparent"
                        onClick={toggle}
                        size="xs"
                        rightSection={
                            opened ? <IconChevronUp /> : <IconChevronDown />
                        }
                    >
                        History
                    </Button>
                    <Collapse in={opened}>
                        <Vouchers
                            onExecute={onExecuteVoucher}
                            token={token}
                            vouchers={vouchers}
                        />
                    </Collapse>
                </>
            )}
        </Stack>
    );
};
