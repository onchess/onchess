"use client";

import {
    ABI,
    CreateGamePayload,
    GameBasePayload,
    MovePiecePayload,
    State,
    createPlayer,
} from "@onchess/core";
import { useState } from "react";
import {
    Address,
    Hash,
    WalletCapabilities,
    encodeFunctionData,
    getAddress,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useWriteContracts } from "wagmi/experimental";
import { PlayPage } from "../../components/PlayPage";
import { usePaymasterServiceSupport } from "../../hooks/capabilities";
import { useClock } from "../../hooks/clock";
import { useApplicationAddress } from "../../hooks/config";
import {
    inputBoxAbi,
    inputBoxAddress,
    useWriteInputBoxAddInput,
} from "../../hooks/contracts";
import { useSessionId } from "../../hooks/session";
import { useLatestState } from "../../hooks/state";

const selectPlayerState = (state: State, address?: Address) => {
    const player = address
        ? state.players[getAddress(address)] ?? createPlayer(address)
        : undefined;
    const lobby = address
        ? state.lobby.filter((item) => item.player === getAddress(address))
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
    const { address } = useAccount();
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
    const firstLobby = playerState.lobby[0];

    // transactions
    const { writeContractAsync: addInput, isPending: addInputPending } =
        useWriteInputBoxAddInput();
    const { writeContractsAsync, isPending: movePending } = useWriteContracts();

    // transaction mining
    const [hash, setHash] = useState<Hash | undefined>();
    const { isFetching } = useWaitForTransactionReceipt({ hash });

    // paymaster support
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

    // error state
    const [error, setError] = useState<string | undefined>();

    // session keys
    const {
        expiry: sessionExpiry,
        sessionId,
        requestPermissionsAsync,
        supported: sessionSupported,
    } = useSessionId();

    const handleCreate = async (
        params: Omit<CreateGamePayload, "metadata">,
    ) => {
        if (playerState.player && dapp) {
            // clear error
            setError(undefined);

            try {
                const { bet, timeControl, minRating, maxRating } = params;
                const payload = encodeFunctionData({
                    abi: ABI,
                    functionName: "create",
                    args: [
                        BigInt(bet),
                        timeControl,
                        Math.ceil(minRating),
                        Math.floor(maxRating),
                    ],
                });
                if (paymasterSupported && paymasterUrl) {
                    // use paymaster
                    const hash = await writeContractsAsync({
                        contracts: [
                            {
                                address: inputBoxAddress,
                                abi: inputBoxAbi,
                                functionName: "addInput",
                                args: [dapp, payload],
                            },
                        ],
                        capabilities: {
                            paymasterService: {
                                url: paymasterUrl,
                            },
                        },
                    });
                } else {
                    const hash = await addInput({ args: [dapp, payload] });
                    setHash(hash);
                }
            } catch (e: any) {
                setError(e.message);
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
                const address = params.address as Address;
                const move = params.move;
                const payload = encodeFunctionData({
                    abi: ABI,
                    functionName: "move",
                    args: [address, move],
                });
                const capabilities: WalletCapabilities = {};
                if (sessionId) {
                    capabilities.permissions = { sessionId };
                }
                if (paymasterSupported && paymasterUrl) {
                    capabilities.paymasterService = { url: paymasterUrl };
                }
                const hash = await writeContractsAsync({
                    contracts: [
                        {
                            address: inputBoxAddress,
                            abi: inputBoxAbi,
                            functionName: "addInput",
                            args: [dapp, payload],
                        },
                    ],
                    capabilities,
                });
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    const handleResign = async (params: Omit<GameBasePayload, "metadata">) => {
        if (playerState.player && dapp) {
            const address = params.address as Address;
            const payload = encodeFunctionData({
                abi: ABI,
                functionName: "resign",
                args: [address],
            });
            const hash = await addInput({ args: [dapp, payload] });
            setHash(hash);
        }
    };

    const handleClaimVictory = async (
        params: Omit<GameBasePayload, "metadata">,
    ) => {
        if (playerState.player && dapp) {
            const address = params.address as Address;
            const payload = encodeFunctionData({
                abi: ABI,
                functionName: "claim",
                args: [address],
            });
            const hash = await addInput({ args: [dapp, payload] });
            setHash(hash);
        }
    };

    const handleCreateSession = async () => {
        await requestPermissionsAsync(now + 3600); // XXX: 1 hour
    };

    return (
        <PlayPage
            error={error}
            game={firstGame}
            lobby={firstLobby}
            miw={400}
            now={now}
            onClaimVictory={handleClaimVictory}
            onCreate={handleCreate}
            onCreateSession={sessionSupported ? handleCreateSession : undefined}
            onMove={handleMove}
            onResign={handleResign}
            player={playerState.player}
            sessionExpiry={sessionExpiry}
            sessionId={sessionId}
            submitting={isFetching || addInputPending || movePending}
            token={token}
        />
    );
};

export default Play;
