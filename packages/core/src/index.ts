import { createSlice } from "@reduxjs/toolkit";
import { type Address, getAddress } from "viem";
import { createPlayer } from "./players.js";
import {
    cancelReducer,
    claimReducer,
    createReducer,
    depositReducer,
    joinReducer,
    moveReducer,
    resignReducer,
    setRakeDividerReducer,
    shutdownReducer,
    transferOwnershipReducer,
    upgradeReducer,
    withdrawRakeReducer,
    withdrawReducer,
} from "./reducers/index.js";
import type { Game, LobbyItem, State } from "./state.js";

export * from "./app.js";
export * from "./payloads.js";
export * from "./players.js";
export * from "./state.js";
export * from "./time.js";

const chessSlice = (initialState: State) => {
    return createSlice({
        name: "chess",
        initialState,
        reducers: {
            cancel: cancelReducer,
            claim: claimReducer,
            create: createReducer,
            deposit: depositReducer,
            join: joinReducer,
            move: moveReducer,
            resign: resignReducer,
            setRakeDivider: setRakeDividerReducer,
            shutdown: shutdownReducer,
            transferOwnership: transferOwnershipReducer,
            upgrade: upgradeReducer,
            withdraw: withdrawReducer,
            withdrawRake: withdrawRakeReducer,
        },
        selectors: {
            selectLobby: (state) => state.lobby,
            selectPlayer: (state, address?: Address) =>
                address
                    ? (state.players[getAddress(address)] ??
                      createPlayer(address))
                    : undefined,
            selectPlayerState: (state, address?: Address) => {
                const player = address
                    ? (state.players[getAddress(address)] ??
                      createPlayer(address))
                    : undefined;
                const lobby = address
                    ? Object.values(state.lobby)
                          .filter((item) => item.player === getAddress(address))
                          .reduce<Record<Address, LobbyItem>>((acc, item) => {
                              acc[item.address] = item;
                              return acc;
                          }, {})
                    : {};
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
            },
        },
    });
};

export type ChessSlice = ReturnType<typeof chessSlice>;
export default chessSlice;
