"use client";

import { Group, Stack, StackProps } from "@mantine/core";
import {
    CreateGamePayload,
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

export interface PlayPageProps extends StackProps {
    game?: Game;
    now: number;
    onClaimVictory: (params: Omit<GameBasePayload, "metadata">) => void;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
    onMove: (params: Omit<MovePiecePayload, "metadata" | "sender">) => void;
    onResign: (params: Omit<GameBasePayload, "metadata">) => void;
    player?: Player;
    submitting: boolean;
    token: Token;
}

export const PlayPage: FC<PlayPageProps> = (props) => {
    const {
        game,
        now,
        onClaimVictory,
        onCreate,
        onMove,
        onResign,
        player,
        submitting,
        token,
        ...stackProps
    } = props;
    return (
        <Stack {...stackProps}>
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
                        submitting={submitting}
                    />
                )}
                {!game && (
                    <Stack>
                        <CreateGame
                            miw={600}
                            player={player}
                            symbol={token.symbol}
                            decimals={token.decimals}
                            onCreate={onCreate}
                        />
                    </Stack>
                )}
            </Group>
        </Stack>
    );
};
