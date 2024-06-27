import { Group, Stack, Text } from "@mantine/core";
import { FC } from "react";
import { Address, Hex, decodeFunctionData, parseAbi } from "viem";
import { AddressText } from "../AddressText";

export type HumanReadableABIVoucherProps = {
    destination: Address;
    executed: boolean | undefined;
    humanReadableAbi: readonly string[];
    payload: Hex;
};

export const HumanABIVoucher: FC<HumanReadableABIVoucherProps> = ({
    destination,
    humanReadableAbi,
    payload,
}) => {
    const abi = parseAbi(humanReadableAbi);
    const { functionName, args } = decodeFunctionData({
        abi,
        data: payload,
    });
    return (
        <Group>
            <Stack gap={0}>
                <Text size="xs">Destination</Text>
                <AddressText address={destination} />
            </Stack>
            <Stack gap={0}>
                <Text size="xs">Function</Text>
                <Text>{functionName}</Text>
            </Stack>
            <Stack gap={0}>
                <Text size="xs">Args</Text>
                <Text>{JSON.stringify(args)}</Text>
            </Stack>
        </Group>
    );
    return null;
};
