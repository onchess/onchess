import { Badge, Button, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Token } from "@onchess/core";
import { FC } from "react";
import { parseUnits } from "viem";

export interface WithdrawProps {
    applicationBalance: string;
    executing: boolean;
    onWithdraw: (amount: string) => void;
    token: Token;
}

export const Withdraw: FC<WithdrawProps> = (props) => {
    const { executing, onWithdraw } = props;
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

    const applicationBalance = BigInt(props.applicationBalance);
    const { amount } = form.getTransformedValues();

    const waitAmount = applicationBalance > 0n && amount <= 0n;
    const insufficientBalance =
        applicationBalance < amount || applicationBalance === 0n;
    const canWithdraw = amount > 0n && applicationBalance >= amount;
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
            {canWithdraw && (
                <Button
                    loading={executing}
                    onClick={() => onWithdraw(amount.toString())}
                >
                    Withdraw
                </Button>
            )}
        </Stack>
    );
};
