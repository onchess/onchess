import { Avatar, Badge, BadgeProps, Group, Text } from "@mantine/core";
import { Token } from "@onchess/core";
import { FC } from "react";
import { formatUnits } from "viem";
import classes from "./Balance.module.css";

export type BalanceProps = BadgeProps & {
    balance: string;
    token: Token;
    iconPosition?: "left" | "right";
};

export const Balance: FC<BalanceProps> = (props) => {
    const { balance, token, ...badgeProps } = props;
    const c = balance === "0" ? "dimmed" : undefined;
    const iconPosition = props.iconPosition || "left";

    return (
        <Badge
            size="lg"
            variant="outline"
            color={c === "dimmed" ? "lightgray" : undefined}
            {...badgeProps}
            classNames={classes}
            leftSection={
                iconPosition === "left" && (
                    <Avatar size={24} src="/img/usdc_icon.png" left="-6px" />
                )
            }
            rightSection={
                iconPosition === "right" && (
                    <Avatar size={24} src="/img/usdc_icon.png" left="6px" />
                )
            }
        >
            <Group align="baseline" gap={2}>
                <Text size="lg" c={c}>
                    {formatUnits(BigInt(balance), token.decimals)}
                </Text>
                <Text size="xs" c={c}>
                    {token.symbol}
                </Text>
            </Group>
        </Badge>
    );
};
