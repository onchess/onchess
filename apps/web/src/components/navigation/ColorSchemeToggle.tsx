"use client";
import {
    ActionIcon,
    useComputedColorScheme,
    useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import cx from "clsx";
import classes from "./ColorSchemeToggle.module.css";

export const ColorSchemeToggle = () => {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });
    return (
        <ActionIcon
            size="lg"
            variant="subtle"
            radius="lg"
            onClick={() =>
                setColorScheme(
                    computedColorScheme === "light" ? "dark" : "light",
                )
            }
        >
            <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
        </ActionIcon>
    );
};
