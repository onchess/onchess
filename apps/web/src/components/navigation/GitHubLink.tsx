import { ActionIcon, Anchor } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

export const GitHubLink = () => {
    return (
        <Anchor href="https://github.com/onchess" target="_blank">
            <ActionIcon size="lg" color="gray" variant="subtle" radius="lg">
                <IconBrandGithub
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                />
            </ActionIcon>
        </Anchor>
    );
};
