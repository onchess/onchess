import { Badge, Group, Stack, Text } from "@mantine/core";
import { Token } from "@onchess/core";
import { FC } from "react";
import { Hex, decodeFunctionData, erc20Abi, formatUnits } from "viem";
import { AddressText } from "../AddressText";

export type ERC20VoucherProps = {
    executed: boolean | undefined;
    payload: Hex;
    token: Token;
};

export const ERC20Voucher: FC<ERC20VoucherProps> = ({ payload, token }) => {
    const { functionName, args } = decodeFunctionData({
        abi: erc20Abi,
        data: payload,
    });
    switch (functionName) {
        case "transfer": {
            const [to, amount] = args;
            return (
                <Group>
                    <Badge>Transfer</Badge>
                    <Stack gap={0}>
                        <Text size="xs">To</Text>
                        <AddressText address={to} />
                    </Stack>
                    <Stack gap={0}>
                        <Text size="xs">Amount</Text>
                        <Group align="baseline" gap={5}>
                            <Text>{formatUnits(amount, token.decimals)}</Text>
                            <Text size="xs">{token.symbol}</Text>
                        </Group>
                    </Stack>
                </Group>
            );
        }
    }
    return null;
};
