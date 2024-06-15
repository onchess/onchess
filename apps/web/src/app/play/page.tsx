"use client";

import { ABI, Game, State, createPlayer } from "@onchess/core";
import { useState } from "react";
import { Address, Hash, encodeFunctionData, getAddress } from "viem";
import { useAccount } from "wagmi";
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
              .reduce<Record<Address, Game>>((acc, game) => {
                  acc[game.address] = game;
                  return acc;
              }, {})
        : {};
    return { player, lobby, games };
};

const Play = () => {
    const now = useClock();
    const { state } = useLatestState(20000);
    const { address } = useAccount();
    const playerState = state
        ? selectPlayerState(state, address)
        : {
              player: address ? createPlayer(address) : undefined,
              lobby: [],
              games: {},
          };
    console.log(state);
    const firstGame = Object.values(playerState.games).at(0);

    const { writeContractAsync: addInput } = useWriteInputBoxAddInput();
    const [hash, setHash] = useState<Hash | undefined>();

    return (
        <PlayPage
            game={firstGame}
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
                        args: [BigInt(bet), timeControl, minRating, maxRating],
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
            token={token}
        />
    );
};

export default Play;
