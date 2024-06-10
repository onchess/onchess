import { LobbyItem, Player } from "./state.js";

/**
 * Matchmaking function to match two players based on their game preferences
 * @param item1 existing lobby item
 * @param item2 new lobby to be matched
 * @param player1 player of the existing lobby item
 * @param player2 player of the new lobby item
 * @returns true if the two games can be matched
 */
export const matches = (
    item1: LobbyItem,
    item2: LobbyItem,
    player1: Player,
    player2: Player,
) => {
    if (item1.player === item2.player) {
        return false; // can't play with himself
    }
    if (item1.timeControl !== item2.timeControl) {
        return false; // different time control
    }
    if (item1.bet !== item2.bet) {
        return false; // different bet
    }

    // check rating ranges
    if (player2.rating < item1.minRating) {
        return false; // rating too low
    }
    if (player2.rating > item1.maxRating) {
        return false; // rating too high
    }
    if (player1.rating < item2.minRating) {
        return false; // rating too low
    }
    if (player1.rating > item2.maxRating) {
        return false; // rating too high
    }

    return true;
};
