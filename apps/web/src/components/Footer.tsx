import { Flex, Text } from "@mantine/core";
import { FC } from "react";

export const Footer: FC = () => {
    return (
        <Flex justify="center" align="center">
            <Text c="gray">Copyright © OnChess.xyz</Text>
        </Flex>
    );
};
