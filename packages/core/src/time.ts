// 15m, 25m, 45m, 10m + 10s, 15m + 10s, 25m + 10s, 45m + 10s
export const isValid = (timeControl: string): boolean => {
    // 3600+10 or 3600
    // XXX: we don't support different periods for now
    return /^\d+\+\d+$/.test(timeControl) || /^\d+$/.test(timeControl);
};

/**
 * Parse time control string into main time and increment.
 * @param timeControl string representation of time control
 * @returns array with two numbers, first is the main time per player in seconds, second is the increment per move in seconds
 */
export const parseTimeControl = (timeControl: string): [number, number] => {
    let m = /^(\d+)\+(\d+)$/.exec(timeControl);
    if (m) {
        return [Number.parseInt(m[1], 10), Number.parseInt(m[2], 10)];
    }
    m = /^(\d+)$/.exec(timeControl);
    if (m) {
        return [Number.parseInt(m[1], 10), 0];
    }
    return [0, 0];
};

/**
 * Calculate total time per player in seconds.
 * @param timeControl string representation of time control
 * @returns total time per player in seconds
 */
export const startTime = (timeControl: string): number => {
    const parsed = parseTimeControl(timeControl);
    if (parsed) {
        return parsed[0];
    }
    return 0;
};
