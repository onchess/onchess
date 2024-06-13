"use client";

import { Badge, BadgeProps } from "@mantine/core";
import { FC, useEffect, useState } from "react";

/**
 * Format seconds to "minutes:seconds"
 * @param seconds number of seconds
 * @returns string formatted as "minutes:seconds"
 */
const format = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemainder = seconds % 60;
    return `${minutes}:${secondsRemainder.toString().padStart(2, "0")}`;
};

export interface ClockProps extends BadgeProps {
    active: boolean; // running or paused
    secondsRemaining: number; // from the startTime
    startTime: number; // start timestamp in seconds
}

export const Clock: FC<ClockProps> = (props) => {
    const { active, secondsRemaining, startTime } = props;

    // timestamp when the clock should stop
    const overTime = startTime + secondsRemaining;

    const now = Math.floor(Date.now() / 1000); // in seconds
    const [seconds, setSeconds] = useState(Math.max(overTime - now, 0));

    useEffect(() => {
        if (active) {
            // make the clock tick
            const interval = setInterval(() => {
                // calculate remaining seconds
                const now = Math.floor(Date.now() / 1000); // in seconds
                const seconds = Math.max(overTime - now, 0);

                // stop the clock when it reaches 0
                if (seconds === 0) {
                    clearInterval(interval);
                }
                setSeconds(seconds);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, []);

    // format seconds to "mm:ss"
    const str = format(seconds);

    // red if time is running out, gray if time is over
    const color =
        seconds < 10 ? (seconds > 0 ? "red" : "lightgray") : undefined;

    return (
        <Badge {...props} variant={active ? "dot" : "default"} c={color}>
            {str}
        </Badge>
    );
};
