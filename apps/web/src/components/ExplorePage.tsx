"use client";

import { Stack } from "@mantine/core";
import type { Player, State, Token } from "@onchess/core";
import type { FC } from "react";

import { Games } from "./Games";
import { Leaderboard } from "./Leaderboard";
import { Lobby } from "./Lobby";

export type ExplorePageProps = {
    now: number;
    player?: Player;
    state: State;
    token: Token;
};

export const ExplorePage: FC<ExplorePageProps> = (props) => {
    const { now, player, state, token } = props;
    const { games, lobby, players } = state;
    return (
        <Stack p={20} justify="stretch">
            <Lobby lobby={lobby} player={player} token={token} />
            <Games
                account={player?.address}
                games={games}
                now={now}
                token={token}
            />
            <Leaderboard account={player?.address} players={players} />
        </Stack>
    );
};
