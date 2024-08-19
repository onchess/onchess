"use client";

import { LobbyItem as LobbyItemModel, Player, Token } from "@onchess/core";
import { FC } from "react";
import { Address } from "viem";

import { SimpleGrid, Stack, StackProps } from "@mantine/core";
import { LobbyItem, LobbyItemPlaceholder } from "./LobbyItem";

export type LobbyFilter = Pick<
    LobbyItemModel,
    "bet" | "maxRating" | "minRating" | "timeControl"
>;

export interface LobbyProps extends StackProps {
    lobby: Record<Address, LobbyItemModel>;
    player?: Player;
    token: Token;
}

export const Lobby: FC<LobbyProps> = (props) => {
    const { lobby, player, token } = props;

    /*
    const items = lobby.sort((a, b) => {
        if (account) {
            // put "my" entries first
            if (a.player === account && b.player === account) {
                return b.createdAt - a.createdAt;
            } else if (a.player === account) {
                return -1;
            } else if (b.player === account) {
                return 1;
            } else {
                return b.createdAt - a.createdAt;
            }
        } else {
            // older entries first
            return b.createdAt - a.createdAt;
        }
    });
    */
    const items = Object.values(lobby);

    const cards =
        items.length > 0
            ? items.map((item, index) => (
                  <LobbyItem
                      key={index}
                      item={item}
                      player={player}
                      token={token}
                  />
              ))
            : [<LobbyItemPlaceholder key={0} />];
    return (
        <Stack {...props}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>{cards}</SimpleGrid>
        </Stack>
    );
};
