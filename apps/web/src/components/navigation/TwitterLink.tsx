import { ActionIcon, Anchor } from "@mantine/core";
import { IconBrandX } from "@tabler/icons-react";

export const TwitterLink = () => {
    return (
        <Anchor href="https://x.com/OnChessProject" target="_blank">
            <ActionIcon size="lg" color="gray" variant="subtle" radius="lg">
                <IconBrandX
                    style={{ width: "70%", height: "70%" }}
                    stroke={1.5}
                />
            </ActionIcon>
        </Anchor>
    );
};
