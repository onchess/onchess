import { Address } from "viem";
import { Player, State } from "./state.js";

export const INITIAL_RATING = 1000;

/**
 * Creates a new player from an address
 * @param address ETH address of player
 * @returns new player
 */
export const createPlayer = (address: Address): Player => ({
    address,
    balance: "0",
    draws: 0,
    losses: 0,
    played: 0,
    rating: INITIAL_RATING,
    wins: 0,
});

/**
 * Selector of a player, or create a new player if he doesn't exist
 * @param state state of the game
 * @param address address of player
 * @returns new or existing player
 */
export const getPlayer = (state: State, address: Address): Player => {
    if (!state.players[address]) {
        // create new player
        state.players[address] = createPlayer(address);
    }
    return state.players[address];
};
