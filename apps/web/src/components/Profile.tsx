import { SimpleGrid, Stack } from "@mantine/core";
import { Player, Token } from "@onchess/core";
import { FC } from "react";
import { AddressText } from "./AddressText";
import { Bridge } from "./Bridge";
import { Stat } from "./Stat";

export interface ProfileProps {
    allowance: string; // base layer allowance
    balance: string; // base layer balance
    onApprove: (amount: string) => void;
    onDeposit: (amount: string) => void;
    onWithdraw: (amount: string) => void;
    player: Player;
    token: Token;
}

export const Profile: FC<ProfileProps> = ({
    allowance,
    balance,
    onApprove,
    onDeposit,
    onWithdraw,
    player,
    token,
}) => {
    return (
        <Stack>
            <AddressText
                address={player.address}
                ff="monospace"
                shorten={false}
            />
            <SimpleGrid cols={4}>
                <Stat name="Rating" value={player.rating} />
                <Stat name="Wins" value={player.wins} />
                <Stat name="Losses" value={player.losses} />
                <Stat name="Draws" value={player.draws} />
            </SimpleGrid>
            <Bridge
                allowance={allowance}
                balance={balance}
                applicationBalance={player.balance}
                onApprove={onApprove}
                onDeposit={onDeposit}
                onWithdraw={onWithdraw}
                token={token}
            />
        </Stack>
    );
};
