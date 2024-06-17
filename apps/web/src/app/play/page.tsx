"use client";

import { ABI, State, createPlayer } from "@onchess/core";
import { useState } from "react";
import { Address, Hash, encodeFunctionData, getAddress } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { PlayPage } from "../../components/PlayPage";
import { useClock } from "../../hooks/clock";
import { useWriteInputBoxAddInput } from "../../hooks/contracts";
import { useLatestState } from "../../hooks/state";
import { dapp, token } from "../../providers/config";

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
    const { state } = useLatestState(2000);
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

    const { writeContractAsync: addInput } = useWriteInputBoxAddInput();
    const [hash, setHash] = useState<Hash | undefined>();
    const { isFetching } = useWaitForTransactionReceipt({ hash });

    return (
        <PlayPage
            game={firstGame}
            lobby={firstLobby}
            miw={400}
            now={now}
            onClaimVictory={(params) => {
                if (playerState.player) {
                    const address = params.address as Address;
                    const payload = encodeFunctionData({
                        abi: ABI,
                        functionName: "claim",
                        args: [address],
                    });
                    addInput({ args: [dapp, payload] }).then(setHash);
                }
            }}
            onCreate={(params) => {
                if (playerState.player) {
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
                    addInput({ args: [dapp, payload] }).then(setHash);
                }
            }}
            onMove={(params) => {
                if (playerState.player) {
                    const address = params.address as Address;
                    const move = params.move;
                    const payload = encodeFunctionData({
                        abi: ABI,
                        functionName: "move",
                        args: [address, move],
                    });
                    addInput({ args: [dapp, payload] }).then(setHash);
                }
            }}
            onResign={(params) => {
                if (playerState.player) {
                    const address = params.address as Address;
                    const payload = encodeFunctionData({
                        abi: ABI,
                        functionName: "resign",
                        args: [address],
                    });
                    addInput({ args: [dapp, payload] }).then(setHash);
                }
            }}
            player={playerState.player}
            submitting={isFetching}
            token={token}
        />
    );
};

export default Play;
