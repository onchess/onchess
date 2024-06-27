import { Voucher } from "@deroll/core";
import { Address } from "viem";

/**
 * Configuration of a ERC-20 token used by the game
 */
export interface Token {
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
}

/**
 * Configuration of the app
 */
export interface Config {
    // address of the owner of the app, with special powers
    owner: Address;

    // amount of the bet that goes to the house, i.e. 20n represents 5%, 10n represents 10%
    rakeDivider: number;

    // ERC-20 token used
    token: Token;

    // k factor of ELO calculation
    eloKFactor: number;
}

export interface LobbyItem {
    // address of player proposing the game
    player: Address;

    // game bet amount
    bet: string;

    // time control of game (e.g. 1500, 1500+10, 2700+10, etc.)
    timeControl: string;

    // minimum ELO rating of opponent
    minRating: number;

    // maximum ELO rating of opponent
    maxRating: number;

    // timestamp of creation (seconds since epoch)
    createdAt: number;
}

export interface Game {
    // game address
    address: Address;

    // total pot, white player bet + black player bet
    pot: string;

    // address of white player
    white: Address;

    // address of black player
    black: Address;

    // game state as PGN string (https://en.wikipedia.org/wiki/Portable_Game_Notation)
    pgn: string;

    // time control of game (e.g. 1800, 180+2, 600+5, etc.)
    timeControl: string;

    // timestamp of last game move
    updatedAt: number;

    // white clock, number of seconds left
    whiteTime: number;

    // black clock, number of seconds left
    blackTime: number;

    // game result: 1 (white wins), 0 (black wins), 0.5 (draw), undefined (game in progress)
    result: 1 | 0 | 0.5 | undefined;
}

export interface Message {
    // type of message
    type: "error" | "warn" | "info";

    // message content
    text: string;

    // timestamp of message creation
    timestamp: number;

    // time to live (until when to show)
    ttl: number;
}

export interface Player {
    // address of player
    address: Address;

    // player wallet balance
    balance: string;

    // this player ELO rank
    rating: number;

    // total number of games played
    played: number;

    // total number of wins
    wins: number;

    // total number of losses
    losses: number;

    // total number of draws
    draws: number;

    // message to this player
    message?: Message;
}

export interface State {
    // game configuration
    config: Config;

    // rake balance
    rake: string;

    // all games in the lobby
    lobby: LobbyItem[];

    // all games in progress
    games: Record<Address, Game>;

    // all players
    players: Record<Address, Player>;

    // list of created vouchers
    vouchers: Voucher[];

    // flag to indicate if the app is shutting down
    isShutdown: boolean;
}
