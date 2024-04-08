import { ActionIcon, Anchor, Flex, rem } from "@mantine/core";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { FC } from "react";

export const Header: FC = () => {
    return (
        <Flex justify="flex-end">
            <Anchor href="https://github.com/onchess" target="_blank">
                <ActionIcon size="xl" color="gray" variant="subtle">
                    <IconBrandGithub
                        style={{ width: rem(18), height: rem(18) }}
                        stroke={1.5}
                    />
                </ActionIcon>
            </Anchor>
            <Anchor href="https://x.com/OnChessProject" target="_blank">
                <ActionIcon size="xl" color="gray" variant="subtle">
                    <IconBrandX
                        style={{ width: rem(18), height: rem(18) }}
                        stroke={1.5}
                    />
                </ActionIcon>
            </Anchor>
        </Flex>
    );
};
