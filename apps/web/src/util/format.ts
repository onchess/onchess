import { Token, parseTimeControl } from "@onchess/core";
import humanizeDuration from "humanize-duration";
import { formatUnits } from "viem";

export const formatTimeControl = (time: string) => {
    const [seconds, increment] = parseTimeControl(time);

    if (increment > 0) {
        return `${humanizeDuration(seconds * 1000)} +${increment}s for each move`;
    } else {
        return `${humanizeDuration(seconds * 1000)}`;
    }
};

export const formatAmount = (bet: bigint, token: Token) =>
    `${formatUnits(bet, token.decimals)} ${token.symbol}`;
