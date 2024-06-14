"use client";

import { Group, Stack } from "@mantine/core";
import {
    CreateGamePayload,
    DepositPayload,
    Game,
    GameBasePayload,
    MovePiecePayload,
    Player,
    Token,
} from "@onchess/core";
import { FC } from "react";
import { CreateGame } from "./CreateGame";
import { Gameboard } from "./Gameboard";
import { Header } from "./Header";

export interface PlayPageProps {
    game?: Game;
    now: number;
    onClaimVictory: (params: Omit<GameBasePayload, "metadata">) => void;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
    onDeposit: (params: Omit<DepositPayload, "metadata" | "sender">) => void;
    onMove: (params: Omit<MovePiecePayload, "metadata" | "sender">) => void;
    onResign: (params: Omit<GameBasePayload, "metadata">) => void;
    player?: Player;
    token: Token;
}

export const PlayPage: FC<PlayPageProps> = (props) => {
    const {
        game,
        now,
        onClaimVictory,
        onCreate,
        onDeposit,
        onMove,
        onResign,
        player,
        token,
    } = props;
    return (
        <Stack>
            <Header player={player} token={token} />
            <Group wrap="nowrap" justify="space-around">
                {game && (
                    <Gameboard
                        game={game}
                        now={now}
                        onClaimVictory={onClaimVictory}
                        onMove={onMove}
                        onResign={onResign}
                        player={player}
                    />
                )}
                {!game && (
                    <Stack>
                        <CreateGame
                            miw={400}
                            player={player}
                            symbol={token.symbol}
                            decimals={token.decimals}
                            onCreate={onCreate}
                            onDeposit={onDeposit}
                        />
                    </Stack>
                )}
            </Group>
        </Stack>
    );
};
