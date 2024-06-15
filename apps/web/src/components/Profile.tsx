import { SimpleGrid, Stack } from "@mantine/core";
import { Player, Token } from "@onchess/core";
import { FC } from "react";
import { Bridge } from "./Bridge";
import { Stat } from "./Stat";

export interface ProfileProps {
    allowance: string; // base layer allowance
    balance: string; // base layer balance
    executing: boolean;
    onApprove: (amount: string) => void;
    onDeposit: (amount: string) => void;
    onWithdraw: (amount: string) => void;
    player: Player;
    token: Token;
}

export const Profile: FC<ProfileProps> = ({
    allowance,
    balance,
    executing,
    onApprove,
    onDeposit,
    onWithdraw,
    player,
    token,
}) => {
    return (
        <Stack>
            <SimpleGrid cols={4}>
                <Stat name="Rating" value={player.rating} />
                <Stat name="Wins" value={player.wins} />
                <Stat name="Losses" value={player.losses} />
                <Stat name="Draws" value={player.draws} />
            </SimpleGrid>
            <Bridge
                allowance={allowance}
                applicationBalance={player.balance}
                balance={balance}
                executing={executing}
                onApprove={onApprove}
                onDeposit={onDeposit}
                onWithdraw={onWithdraw}
                token={token}
            />
        </Stack>
    );
};
