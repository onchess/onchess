"use client";
import { Flex, Stack, type StackProps, em } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type {
    Challenge,
    ChallengeBasePayload,
    CreateGamePayload,
    Game,
    GameBasePayload,
    MovePiecePayload,
    Player,
    Token,
} from "@onchess/core";
import type { FC } from "react";
import type { Address } from "viem";
import { Gameboard } from "./Gameboard";
import { Shell } from "./navigation/Shell";
import { Lobby } from "./play/Lobby";

export interface PlayPageProps extends StackProps {
    address?: Address;
    error?: string;
    game?: Game;
    isConnected: boolean;
    isConnecting: boolean;
    lobby: Record<Address, Challenge>;
    now: number;
    onClaimVictory: (params: Omit<GameBasePayload, "metadata">) => void;
    onCancel: (params: Omit<ChallengeBasePayload, "metadata">) => void;
    onConnect: () => void;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
    onCreateSession?: () => void;
    onDeposit: (amount: string) => void;
    onDisconnect: () => void;
    onJoin: (params: Omit<ChallengeBasePayload, "metadata">) => void;
    onLogin?: () => void;
    onMove: (params: Omit<MovePiecePayload, "metadata" | "sender">) => void;
    onRegister?: () => void;
    onResign: (params: Omit<GameBasePayload, "metadata">) => void;
    pastGames: Game[];
    player?: Player;
    players: Record<Address, Player>;
    sessionExpiry?: number;
    sessionId?: string;
    sessionSupported?: boolean;
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
        onCancel,
        onClaimVictory,
        onConnect,
        onCreate,
        onCreateSession,
        onDeposit,
        onDisconnect,
        onJoin,
        onLogin,
        onMove,
        onRegister,
        onResign,
        pastGames,
        player,
        players,
        sessionExpiry,
        sessionId,
        sessionSupported,
        submitting,
        token,
        ...stackProps
    } = props;

    // show game if is not waiting and there is a game
    const showGame = game !== undefined;

    // show lobby if it is showing create
    const showLobby = token && game === undefined;

    const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

    return (
        <Shell
            address={address}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={onConnect}
            onLogin={onLogin}
            onRegister={onRegister}
            onDisconnect={onDisconnect}
            player={player}
            token={token}
        >
            <Stack {...stackProps}>
                <Stack p={20} align={isMobile ? undefined : "center"}>
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
                            sessionSupported={sessionSupported}
                            submitting={submitting}
                        />
                    )}
                    {showLobby && (
                        <Lobby
                            executing={submitting}
                            lobby={Object.values(lobby)}
                            onCancel={onCancel}
                            onConnect={onConnect}
                            onCreate={onCreate}
                            onDeposit={onDeposit}
                            onJoin={onJoin}
                            player={player}
                            players={players}
                            token={token}
                        />
                    )}
                    {!game && (
                        <Flex gap={20} wrap="wrap" mt={50}>
                            {pastGames.map((game) => (
                                <Gameboard
                                    key={game.address}
                                    game={game}
                                    now={now}
                                    onClaimVictory={() => {}}
                                    onCreateSession={() => {}}
                                    onMove={() => {}}
                                    onResign={() => {}}
                                    player={player}
                                    sessionExpiry={sessionExpiry}
                                    sessionId={sessionId}
                                    sessionSupported={sessionSupported}
                                    submitting={false}
                                />
                            ))}
                        </Flex>
                    )}
                </Stack>
            </Stack>
        </Shell>
    );
};
