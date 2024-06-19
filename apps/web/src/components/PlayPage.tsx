"use client";

import { Center, Stack, StackProps } from "@mantine/core";
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
    token?: Token;
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

    // show wait if there is a lobby
    const showWait = lobby !== undefined && token !== undefined;

    // show create if game is over or if there is no game
    const showCreate =
        !showWait &&
        (game === undefined || game.result !== undefined) &&
        token !== undefined;

    // show game if is not waiting and there is a game
    const showGame = !showWait && game !== undefined;
    return (
        <Stack {...stackProps}>
            <Header player={player} token={token} />
            <Stack p={20}>
                <Center>
                    {showGame && (
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
                </Center>
                <Center>
                    {showCreate && (
                        <CreateGame
                            miw={600}
                            player={player}
                            symbol={token.symbol}
                            decimals={token.decimals}
                            onCreate={onCreate}
                        />
                    )}
                    {showWait && <WaitOpponent lobby={lobby} token={token} />}
                </Center>
            </Stack>
        </Stack>
    );
};
