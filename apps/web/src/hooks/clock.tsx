import { useEffect, useState } from "react";

/**
 * Return the current time in seconds
 * @param resolution how often the clock should update in milliseconds
 * @returns clock in seconds
 */
export const useClock = (resolution: number = 1000) => {
    const [clock, setClock] = useState(Math.floor(Date.now() / 1000));
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            setClock(now);
        }, resolution);
        return () => clearInterval(interval);
    }, []);
    return clock;
};

export const useTimeLeft = (
    active: boolean,
    lastMove: number,
    clock: number,
): number => {
    // now in secods
    const now = Math.floor(Date.now() / 1000);

    // initialize the time left with clock if not active, or calculate the remaining time if active
    const elapsed = now - lastMove;
    const [timeLeft, setTimeLeft] = useState(
        active ? Math.max(clock - elapsed, 0) : clock,
    );

    useEffect(() => {
        if (active) {
            // make the clock tick
            const interval = setInterval(() => {
                // calculate remaining seconds
                const now = Math.floor(Date.now() / 1000); // in seconds
                const elapsed = now - lastMove;
                const timeLeft = Math.max(clock - elapsed, 0);

                // stop the clock when it reaches 0
                if (timeLeft === 0) {
                    clearInterval(interval);
                }
                setTimeLeft(timeLeft);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [active]);

    return timeLeft;
};
