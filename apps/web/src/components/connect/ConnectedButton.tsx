import { Group, Paper } from "@mantine/core";
import { FC } from "react";
import { Account, AccountProps } from "./Account";
import { Balance, BalanceProps } from "./Balance";

export type ConnectedButtonProps = AccountProps & BalanceProps;

export const ConnectedButton: FC<ConnectedButtonProps> = (props) => {
    return (
        <Paper withBorder p={5} shadow="sm">
            <Group gap="xs">
                <Account
                    address={props.address}
                    ensAvatar={props.ensAvatar}
                    ensName={props.ensName}
                />
                <Balance
                    balance={props.balance}
                    visibleFrom="sm"
                    iconPosition="right"
                    loading={props.loading}
                    token={props.token}
                    variant="transparent"
                />
            </Group>
        </Paper>
    );
};
