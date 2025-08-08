import { Progress, Stack, Text } from "@mantine/core";
import type { FC } from "react";

export const InputStatus: FC<{
    inputIndex: bigint;
    message?: string;
}> = (props) => {
    const { inputIndex, message } = props;
    return (
        <Stack bg="lightyellow" gap={0}>
            <Text p={10}>
                {message ?? `Waiting processing of input ${inputIndex}...`}
            </Text>
            <Progress size="xs" value={100} animated />
        </Stack>
    );
};
