import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { FC } from "react";

export interface StatProps {
    name: string;
    value: number;
    icon?: Icon;
}

export const Stat: FC<StatProps> = ({ name, value }) => {
    return (
        <Paper p={20} withBorder>
            <Stack gap={0}>
                <Group>
                    <Text size="sm">{name}</Text>
                </Group>
                <Title order={2}>{value}</Title>
            </Stack>
        </Paper>
    );
};
