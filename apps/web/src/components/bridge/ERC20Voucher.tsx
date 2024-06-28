import { Badge, Button, Group, Text } from "@mantine/core";
import { Token } from "@onchess/core";
import { FC } from "react";
import { Hex, decodeFunctionData, erc20Abi, formatUnits } from "viem";
import { ExecutableVoucher } from "../../hooks/voucher";

export type ERC20VoucherProps = {
    executing: boolean;
    onExecute: () => void;
    voucher: ExecutableVoucher;
    token: Token;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
});

export const ERC20Voucher: FC<ERC20VoucherProps> = (props) => {
    const { executing, onExecute, token, voucher } = props;
    const { executable, executed, input, payload } = voucher;
    const { timestamp } = input;

    const { functionName, args } = decodeFunctionData({
        abi: erc20Abi,
        data: payload as Hex,
    });

    switch (functionName) {
        case "transfer": {
            const [_to, amount] = args;
            const time = dateFormatter.format(timestamp * 1000);
            const text = `${formatUnits(amount, token.decimals)} ${token.symbol} requested at ${time}`;
            return (
                <Group justify="space-between">
                    <Text size="sm">{text}</Text>
                    {!executed && (
                        <Button
                            disabled={!executable}
                            loading={executing}
                            onClick={onExecute}
                            size="compact-xs"
                        >
                            Execute
                        </Button>
                    )}
                    {executed && (
                        <Badge size="sm" variant="light">
                            Fullfilled
                        </Badge>
                    )}
                </Group>
            );
        }
    }
    return null;
};
