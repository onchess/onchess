import { createSlice } from "@reduxjs/toolkit";
import { Address, getAddress } from "viem";
import { createPlayer } from "./players.js";
import {
    cancelReducer,
    claimReducer,
    createReducer,
    depositReducer,
    moveReducer,
    resignReducer,
    withdrawReducer,
} from "./reducers/index.js";
import { Game, State } from "./state.js";
import { AppConfig } from "./types.js";

export * from "./app.js";
export * from "./payloads.js";
export * from "./players.js";
export * from "./state.js";
export * from "./time.js";
export * from "./types.js";

const initialState: State = {
    rake: "0",
    games: {},
    lobby: [],
    players: {},
    vouchers: [],
};

const chessSlice = (config: AppConfig) =>
    createSlice({
        name: "chess",
        initialState,
        reducers: {
            deposit: depositReducer,
            create: createReducer,
            cancel: cancelReducer,
            move: moveReducer(config),
            resign: resignReducer(config),
            claim: claimReducer(config),
            withdraw: withdrawReducer(config),
        },
        selectors: {
            selectLobby: (state) => state.lobby,
            selectPlayer: (state, address?: Address) =>
                address
                    ? state.players[getAddress(address)] ??
                      createPlayer(address)
                    : undefined,
            selectPlayerState: (state, address?: Address) => {
                const player = address
                    ? state.players[getAddress(address)] ??
                      createPlayer(address)
                    : undefined;
                const lobby = address
                    ? state.lobby.filter(
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
                          .reduce<Record<Address, Game>>((acc, game) => {
                              acc[game.address] = game;
                              return acc;
                          }, {})
                    : {};
                return { player, lobby, games };
            },
        },
    });

export type ChessSlice = ReturnType<typeof chessSlice>;
export default chessSlice;
