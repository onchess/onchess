import { Anchor, Button } from "@mantine/core";
import { IconBuildingBridge, IconChessQueenFilled } from "@tabler/icons-react";

export const Menu = () => {
    return (
        <>
            <Anchor href="/play">
                <Button variant="subtle" leftSection={<IconChessQueenFilled />}>
                    Play
                </Button>
            </Anchor>
            <Anchor href="/bridge">
                <Button variant="subtle" leftSection={<IconBuildingBridge />}>
                    Bridge
                </Button>
            </Anchor>
        </>
    );
};
