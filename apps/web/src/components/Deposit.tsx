import { Badge, Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Token } from "@onchess/core";
import { FC } from "react";
import { parseUnits } from "viem";

export interface DepositProps {
    allowance: string;
    balance: string;
    executing: boolean;
    onApprove: (amount: string) => void;
    onDeposit: (amount: string) => void;
    token: Token;
}

export const Deposit: FC<DepositProps> = (props) => {
    const { executing, onApprove, onDeposit } = props;
    const { decimals, symbol } = props.token;

    const form = useForm({
        initialValues: { amount: "" },
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

    const allowance = BigInt(props.allowance);
    const balance = BigInt(props.balance);
    const { amount } = form.getTransformedValues();

    const waitAmount = balance > 0n && amount <= 0n;
    const insufficientBalance = balance < amount || balance === 0n;
    const canDeposit = amount > 0n && balance >= amount && allowance >= amount;
    const needApproval = amount > 0n && balance >= amount && allowance < amount;
    return (
        <Stack>
            <TextInput
                withAsterisk
                label="Amount"
                key={form.key("amount")}
                {...form.getInputProps("amount")}
                rightSection={<Badge variant="white">{symbol}</Badge>}
                rightSectionWidth={60}
            />
            {waitAmount && <Button disabled>Enter amount</Button>}
            {insufficientBalance && (
                <Button disabled>Insufficient balance</Button>
            )}
            {needApproval && (
                <Button
                    loading={executing}
                    onClick={() => onApprove(amount.toString())}
                >
                    Approve
                </Button>
            )}
            {canDeposit && (
                <Button
                    loading={executing}
                    onClick={() => onDeposit(amount.toString())}
                >
                    Deposit
                </Button>
            )}
        </Stack>
    );
};
