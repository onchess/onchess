import { Badge, Button, Group, Text } from "@mantine/core";
import type { Token } from "@onchess/core";
import type { FC } from "react";
import { decodeFunctionData, erc20Abi, formatUnits } from "viem";
import type { ExecutableVoucher } from "../../hooks/voucher";

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
    const { createdAt, executable, executed, decodedData } = voucher;
    const { payload } = decodedData;

    const { functionName, args } = decodeFunctionData({
        abi: erc20Abi,
        data: payload,
    });

    switch (functionName) {
        case "transfer": {
            const [_to, amount] = args;
            const time = dateFormatter.format(createdAt);
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
