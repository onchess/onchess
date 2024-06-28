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
import { Address } from "viem";
import { CreateGame } from "./CreateGame";
import { Gameboard } from "./Gameboard";
import { Header } from "./Header";
import { WaitOpponent } from "./WaitOpponent";

export interface PlayPageProps extends StackProps {
    address?: Address;
    error?: string;
    game?: Game;
    isConnected: boolean;
    isConnecting: boolean;
    lobby?: LobbyItem;
    now: number;
    onClaimVictory: (params: Omit<GameBasePayload, "metadata">) => void;
    onConnect: () => void;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
    onCreateSession?: () => void;
    onDeposit: (amount: string) => void;
    onDisconnect: () => void;
    onMove: (params: Omit<MovePiecePayload, "metadata" | "sender">) => void;
    onResign: (params: Omit<GameBasePayload, "metadata">) => void;
    player?: Player;
    sessionExpiry?: number;
    sessionId?: string;
    submitting: boolean;
    token?: Token;
}

export const PlayPage: FC<PlayPageProps> = (props) => {
    const {
        address,
        error,
        game,
        lobby,
        now,
        isConnected,
        isConnecting,
        onClaimVictory,
        onConnect,
        onCreate,
        onCreateSession,
        onDeposit,
        onDisconnect,
        onMove,
        onResign,
        player,
        sessionExpiry,
        sessionId,
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
            <Header
                address={address}
                isConnected={isConnected}
                isConnecting={isConnecting}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                player={player}
                token={token}
            />
            <Stack p={20}>
                <Center>
                    {showGame && (
                        <Gameboard
                            error={error}
                            game={game}
                            now={now}
                            onClaimVictory={onClaimVictory}
                            onCreateSession={onCreateSession}
                            onMove={onMove}
                            onResign={onResign}
                            player={player}
                            sessionExpiry={sessionExpiry}
                            sessionId={sessionId}
                            submitting={submitting}
                        />
                    )}
                </Center>
                <Center>
                    {showCreate && (
                        <CreateGame
                            error={error}
                            executing={submitting}
                            miw={600}
                            player={player}
                            onCreate={onCreate}
                            onConnect={onConnect}
                            onDeposit={onDeposit}
                            token={token}
                        />
                    )}
                    {showWait && (
                        <WaitOpponent lobby={lobby} maw={600} token={token} />
                    )}
                </Center>
            </Stack>
        </Stack>
    );
};
