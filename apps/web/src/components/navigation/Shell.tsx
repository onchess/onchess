"use client";
import { Anchor, AppShell, Avatar, Burger, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { FC, PropsWithChildren } from "react";
import { Header, type HeaderProps } from "../Header";
import { Navbar } from "./Navbar";

export type ShellProps = HeaderProps & PropsWithChildren;

export const Shell: FC<ShellProps> = (props) => {
    const { children, ...headerProps } = props;
    const [opened, { toggle }] = useDisclosure();
    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 100,
                breakpoint: "sm",
                collapsed: { desktop: true, mobile: !opened },
            }}
            padding="md"
        >
            <AppShell.Header withBorder={false}>
                <Group h="100%" gap={0} justify="space-between">
                    <Group px="md">
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                            size="sm"
                        />
                        <Anchor href="/">
                            <Avatar src="/img/onchess_logo.png" size="md" />
                        </Anchor>
                        <Text ff="Cardo" fz={26} visibleFrom="md">
                            OnChess
                        </Text>
                    </Group>
                    <Header {...headerProps} />
                </Group>
            </AppShell.Header>
            <AppShell.Navbar>
                <Navbar />
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
