"use client";

import { Group, Stack, StackProps } from "@mantine/core";
import {
    CreateGamePayload,
    Game,
    GameBasePayload,
    LobbyItem,
    MovePiecePayload,
    Player,
    Token,
} from "@onchess/core";
import { FC } from "react";
import { CreateGame } from "./CreateGame";
import { Gameboard } from "./Gameboard";
import { Header } from "./Header";
import { WaitOpponent } from "./WaitOpponent";

export interface PlayPageProps extends StackProps {
    game?: Game;
    lobby?: LobbyItem;
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
        lobby,
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
                {!game && !lobby && (
                    <CreateGame
                        miw={600}
                        player={player}
                        symbol={token.symbol}
                        decimals={token.decimals}
                        onCreate={onCreate}
                    />
                )}
                {lobby && <WaitOpponent lobby={lobby} token={token} />}
            </Group>
        </Stack>
    );
};
