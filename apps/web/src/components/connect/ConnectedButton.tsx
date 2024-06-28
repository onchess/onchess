import { Group, Paper, em } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FC } from "react";
import { Account, AccountProps } from "./Account";
import { Balance, BalanceProps } from "./Balance";

export type ConnectedButtonProps = AccountProps & BalanceProps;

export const ConnectedButton: FC<ConnectedButtonProps> = (props) => {
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

    return (
        <Paper withBorder p={5} shadow="sm">
            <Group>
                <Account
                    address={props.address}
                    ensAvatar={props.ensAvatar}
                    ensName={props.ensName}
                />
                {!isMobile && (
                    <Balance
                        balance={props.balance}
                        iconPosition="right"
                        loading={props.loading}
                        token={props.token}
                        variant="transparent"
                    />
                )}
            </Group>
        </Paper>
    );
};
