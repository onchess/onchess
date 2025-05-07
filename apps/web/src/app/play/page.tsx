"use client";

import { useWriteInputBoxAddInput } from "@cartesi/wagmi";
import type {
    CreateGamePayload,
    GameBasePayload,
    MovePiecePayload,
    State,
} from "@onchess/core";
import { createPlayer } from "@onchess/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Address, type Hash, getAddress } from "viem";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useWaitForTransactionReceipt,
} from "wagmi";
import { PlayPage } from "../../components/PlayPage";
import { useChessActions } from "../../hooks/chess";
import { useClock } from "../../hooks/clock";
import { useApplicationAddress } from "../../hooks/config";
import { useSessionId } from "../../hooks/session";
import { useLatestState } from "../../hooks/state";

const selectPlayerState = (state: State, address?: Address) => {
    const player = address
        ? (state.players[getAddress(address)] ?? createPlayer(address))
        : undefined;
    const lobby = address
        ? Object.values(state.lobby).filter(
              (item) => item.player === getAddress(address),
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
    const { connect, connectors, isPending: isConnecting } = useConnect();
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
    const firstGame =
        playerState.unfinishedGames[0] || playerState.finishedGames[0];

    // paymaster configuration
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

    // transactions
    const {
        claimVictoryAsync,
        createGameAsync,
        isPending,
        resignAsync,
        sendMoveAsync,
    } = useChessActions(paymasterUrl);
    const { writeContractAsync: addInputAsync, isPending: addInputPending } =
        useWriteInputBoxAddInput();

    // transaction mining
    const [hash, setHash] = useState<Hash | undefined>();
    const { isFetching } = useWaitForTransactionReceipt({ hash });

    // error state
    const [error, setError] = useState<string | undefined>();

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
        if (playerState.player && dapp) {
            // clear error
            setError(undefined);
            try {
                const { id } = await createGameAsync(dapp, params);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "An error occurred");
            }
        }
    };

    const handleMove = async (
        params: Omit<MovePiecePayload, "sender" | "metadata">,
    ) => {
        if (playerState.player && dapp) {
            // reset error
            setError(undefined);

            try {
                if (sessionId) {
                    // capabilities.permissions = { sessionId }; // XXX
                }
                const { id } = await sendMoveAsync(dapp, params);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "An error occurred");
            }
        }
    };

    const handleResign = async (params: Omit<GameBasePayload, "metadata">) => {
        if (playerState.player && dapp) {
            // reset error
            setError(undefined);
            try {
                const { id } = await resignAsync(dapp, params);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "An error occurred");
            }
        }
    };

    const handleClaimVictory = async (
        params: Omit<GameBasePayload, "metadata">,
    ) => {
        if (playerState.player && dapp) {
            // reset error
            setError(undefined);
            try {
                const { id } = await claimVictoryAsync(dapp, params);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "An error occurred");
            }
        }
    };

    const handleCreateSession = async () => {
        await requestPermissionsAsync(now + 3600); // XXX: 1 hour
    };

    const handleDeposit = async (amount: string) => {
        router.push(`/bridge?deposit=${amount}`);
    };

    return (
        <PlayPage
            address={address}
            error={error}
            game={firstGame}
            isConnected={isConnected}
            isConnecting={isConnecting}
            lobby={state?.lobby ?? {}}
            miw={400}
            now={now}
            onClaimVictory={handleClaimVictory}
            onCreate={handleCreate}
            onConnect={handleConnect}
            onDisconnect={disconnect}
            onCreateSession={sessionSupported ? handleCreateSession : undefined}
            onDeposit={handleDeposit}
            onMove={handleMove}
            onResign={handleResign}
            player={playerState.player}
            sessionExpiry={sessionExpiry}
            sessionId={sessionId}
            sessionSupported={sessionSupported}
            submitting={
                isFetching || addInputPending || isPending || isConnecting
            }
            token={token}
        />
    );
};

export default Play;
