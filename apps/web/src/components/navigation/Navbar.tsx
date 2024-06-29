"use client";
import { Button, Group, Stack } from "@mantine/core";
import { IconBuildingBridge, IconChessQueenFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { GitHubLink } from "./GitHubLink";
import { TwitterLink } from "./TwitterLink";

export const Navbar = () => {
    const router = useRouter();
    return (
        <Stack p="md">
            <Button
                leftSection={<IconChessQueenFilled />}
                onClick={() => router.push("/play")}
                size="md"
                variant="default"
            >
                Play
            </Button>
            <Button
                leftSection={<IconBuildingBridge />}
                onClick={() => router.push("/bridge")}
                size="md"
                variant="default"
            >
                Bridge
            </Button>
            <Group justify="space-evenly">
                <GitHubLink />
                <TwitterLink />
            </Group>
        </Stack>
    );
};
