import {
    Avatar,
    Badge,
    type BadgeProps,
    Group,
    Loader,
    Text,
} from "@mantine/core";
import type { Token } from "@onchess/core";
import type { FC } from "react";
import { formatUnits } from "viem";
import classes from "./Balance.module.css";

export type BalanceProps = BadgeProps & {
    balance?: string;
    error?: string;
    loading?: boolean;
    token: Token;
    iconPosition?: "left" | "right";
};

export const Balance: FC<BalanceProps> = (props) => {
    const { balance, error, iconPosition, loading, token, ...badgeProps } =
        props;
    const c = balance === "0" ? "dimmed" : undefined;

    return (
        <Badge
            size="lg"
            variant="outline"
            color={error ? "red" : c === "dimmed" ? "lightgray" : undefined}
            {...badgeProps}
            classNames={classes}
            leftSection={
                iconPosition === "left" ? (
                    <Avatar size={24} src="/img/usdc_icon.png" left="-6px" />
                ) : loading ? (
                    <Loader size={12} />
                ) : undefined
            }
            rightSection={
                iconPosition === "right" ? (
                    <Avatar size={24} src="/img/usdc_icon.png" left="6px" />
                ) : loading ? (
                    <Loader size={12} />
                ) : undefined
            }
        >
            {balance && (
                <Group align="baseline" gap={2} wrap="nowrap">
                    <Text size="lg" c={c} fw={800}>
                        {formatUnits(BigInt(balance), token.decimals)}
                    </Text>
                    <Text size="xs" c={c} fw={800}>
                        {token.symbol}
                    </Text>
                </Group>
            )}
            {error && (
                <Text style={{ textTransform: "none" }} c="red">
                    {error}
                </Text>
            )}
        </Badge>
    );
};
