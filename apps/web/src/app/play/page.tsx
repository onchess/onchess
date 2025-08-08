"use client";

import { em, Flex, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type {
    ChallengeBasePayload,
    CreateGamePayload,
    GameBasePayload,
    MovePiecePayload,
    State,
} from "@onchess/core";
import { createPlayer } from "@onchess/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Address, getAddress } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Gameboard } from "../../components/Gameboard";
import { Shell } from "../../components/navigation/Shell";
import { Lobby } from "../../components/play/Lobby";
import { InputStatus } from "../../containers/InputStatus";
import { useChessActions } from "../../hooks/chess";
import { useClock } from "../../hooks/clock";
import { useApplicationAddress } from "../../hooks/config";
import { useSessionId } from "../../hooks/session";
import { useLatestState } from "../../hooks/state";
import { usePasskeyConnect } from "../../providers/wallet/zerodev/usePasskeyConnect";

const selectPlayerState = (state: State, address?: Address) => {
    const player = address
        ? (state.players[getAddress(address)] ?? createPlayer(address))
        : undefined;
    const lobby = address
        ? Object.values(state.lobby).filter(
              (challenge) => challenge.player === getAddress(address),
          )
        : [];
    const games = address
        ? Object.values(state.games)
              .filter(
                  (game) =>
                      game.white === getAddress(address) ||
                      game.black === getAddress(address),
              )
              .sort((a, b) => b.updatedAt - a.updatedAt)
        : [];
    const unfinishedGames = games.filter((game) => game.result === undefined);
    const finishedGames = games.filter((game) => game.result !== undefined);
    return { player, lobby, unfinishedGames, finishedGames };
};

const Play = () => {
    const now = useClock();
    const dapp = useApplicationAddress();
    const { state } = useLatestState(2000);
    const token = state?.config.token;

    // connection
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { login, register, isPending: isConnecting } = usePasskeyConnect();
    const handleConnect = () => connect({ connector: connectors[0] });
    const { disconnect } = useDisconnect();

    const playerState = state
        ? selectPlayerState(state, address)
        : {
              player: address ? createPlayer(address) : undefined,
              lobby: [],
              finishedGames: [],
              unfinishedGames: [],
          };
    const ongoingGame = playerState.unfinishedGames.at(0);
    const pastGames = playerState.finishedGames;

    // paymaster configuration
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

    // transactions
    const {
        callsStatus,
        inputs,
        claimVictory,
        cancelGame,
        createGame,
        joinGame,
        resign,
        sendMove,
    } = useChessActions(dapp, paymasterUrl);

    // transaction mining
    const [message, setMessage] = useState<string | undefined>();

    // session keys
    const {
        expiry: sessionExpiry,
        sessionId,
        requestPermissionsAsync,
        supported: sessionSupported,
    } = useSessionId();

    // navigation
    const router = useRouter();

    const handleCreate = async (
        params: Omit<CreateGamePayload, "metadata">,
    ) => {
        setMessage("Creating game...");
        if (playerState.player && createGame) {
            createGame(params);
        }
    };

    const handleCancel = async (
        params: Omit<ChallengeBasePayload, "metadata">,
    ) => {
        setMessage("Canceling game...");
        if (playerState.player && cancelGame) {
            cancelGame(params);
        }
    };

    const handleJoin = async (
        params: Omit<ChallengeBasePayload, "metadata">,
    ) => {
        setMessage("Joining game...");
        if (playerState.player && joinGame) {
            joinGame(params);
        }
    };

    const handleMove = async (
        params: Omit<MovePiecePayload, "sender" | "metadata">,
    ) => {
        setMessage("Sending move...");
        if (playerState.player && sendMove) {
            sendMove(params, sessionId);
        }
    };

    const handleResign = async (params: Omit<GameBasePayload, "metadata">) => {
        setMessage("Resigning game...");
        if (playerState.player && resign) {
            resign(params);
        }
    };

    const handleClaimVictory = async (
        params: Omit<GameBasePayload, "metadata">,
    ) => {
        setMessage("Claiming victory...");
        if (playerState.player && claimVictory) {
            claimVictory(params);
        }
    };

    const handleCreateSession = async () => {
        await requestPermissionsAsync(now + 3600); // XXX: 1 hour
    };

    const handleDeposit = async (amount: string) => {
        router.push(`/bridge?deposit=${amount}`);
    };

    // show lobby if it is showing create
    const showLobby = token && ongoingGame === undefined;

    const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

    return (
        <Shell
            address={address}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={handleConnect}
            onLogin={() => login?.({ passkeyName: "OnChess" })}
            onRegister={() => register?.({ passkeyName: "OnChess" })}
            onDisconnect={disconnect}
            player={playerState.player}
            token={token}
        >
            <Stack>
                {inputs?.map((input) => (
                    <InputStatus
                        key={input.index}
                        application={input.appContract}
                        inputIndex={input.index}
                        message={message}
                    />
                ))}
                <Stack p={20} align={isMobile ? undefined : "center"}>
                    {ongoingGame && (
                        <Gameboard
                            error={callsStatus.error?.message}
                            game={ongoingGame}
                            now={now}
                            onClaimVictory={handleClaimVictory}
                            onCreateSession={handleCreateSession}
                            onMove={handleMove}
                            onResign={handleResign}
                            player={playerState.player}
                            sessionExpiry={sessionExpiry}
                            sessionId={sessionId}
                            sessionSupported={sessionSupported}
                            submitting={callsStatus.isLoading || isConnecting}
                        />
                    )}
                    {showLobby && (
                        <Lobby
                            executing={callsStatus.isLoading || isConnecting}
                            lobby={Object.values(state?.lobby ?? {})}
                            onCancel={handleCancel}
                            onConnect={handleConnect}
                            onCreate={handleCreate}
                            onDeposit={handleDeposit}
                            onJoin={handleJoin}
                            player={playerState.player}
                            players={state?.players ?? {}}
                            token={token}
                        />
                    )}
                    {!ongoingGame && (
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
                                    player={playerState.player}
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

export default Play;
