import { Group, Paper, UnstyledButton } from "@mantine/core";
import { FC } from "react";
import { Account, AccountProps } from "./Account";
import { Balance, BalanceProps } from "./Balance";

export type ConnectedButtonProps = AccountProps &
    BalanceProps & {
        onClick?: () => void;
    };

export const ConnectedButton: FC<ConnectedButtonProps> = (props) => {
    return (
        <UnstyledButton onClick={props.onClick}>
            <Paper withBorder p={5}>
                <Group>
                    <Account
                        address={props.address}
                        ensAvatar={props.ensAvatar}
                        ensName={props.ensName}
                    />
                    <Balance
                        balance={props.balance}
                        iconPosition="right"
                        loading={props.loading}
                        token={props.token}
                        variant="transparent"
                    />
                </Group>
            </Paper>
        </UnstyledButton>
    );
};
