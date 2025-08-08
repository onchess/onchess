"use client";

import { Badge, type BadgeProps } from "@mantine/core";
import humanizeDuration from "humanize-duration";
import type { FC } from "react";

const timeHumanizer = humanizeDuration.humanizer({
    delimiter: " ",
    language: "shortEn",
    languages: {
        shortEn: {
            y: () => "y",
            mo: () => "mo",
            w: () => "w",
            d: () => "d",
            h: () => "h",
            m: () => "m",
            s: () => "s",
            ms: () => "ms",
        },
    },
    spacer: "",
});

/**
 * Format seconds to "minutes:seconds"
 * @param seconds number of seconds
 * @returns string formatted as "minutes:seconds"
 */
const format = (seconds: number) => timeHumanizer(seconds * 1000);

export interface ClockProps extends BadgeProps {
    active: boolean; // running or paused
    now: number;
    secondsRemaining: number; // from the startTime
    startTime: number; // start timestamp in seconds
}

export const Clock: FC<ClockProps> = (props) => {
    const { active, now, secondsRemaining, startTime, ...badgeProps } = props;

    // timestamp when the clock should stop
    const overTime = startTime + secondsRemaining;
    const seconds = active ? Math.max(overTime - now, 0) : secondsRemaining;

    // format seconds to "mm:ss"
    const str = format(seconds);

    // red if time is running out, gray if time is over
    const color =
        seconds < 20 ? (seconds > 0 ? "red" : "lightgray") : undefined;

    return (
        <Badge
            {...badgeProps}
            variant={active ? "dot" : "default"}
            c={color}
            style={{ textTransform: "none" }}
        >
            {str}
        </Badge>
    );
};
