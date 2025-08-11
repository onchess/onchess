import type { Player } from "@onchess/core";
import { parseUnits } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { token } from "./config";

const mnemonic = "test test test test test test test test test test test junk";

/**
 * Alice is a player with 32 USDC, 1376 rating, 31 games played, 21 wins, 9 losses, and 1 draw.
 */
const alice: Player = {
    address: mnemonicToAccount(mnemonic, { accountIndex: 0 }).address,
    balance: parseUnits("32", token.decimals).toString(),
    rating: 1376,
    games: 31,
    wins: 21,
    losses: 9,
    draws: 1,
};

/**
 * Bob is a player with 2 USDC, 1000 rating, 2 games played, 1 win, 1 loss, and 0 draws.
 */
const bob: Player = {
    address: mnemonicToAccount(mnemonic, { accountIndex: 1 }).address,
    balance: parseUnits("2", token.decimals).toString(),
    rating: 1000,
    games: 2,
    wins: 1,
    losses: 1,
    draws: 0,
};

/**
 * Charlie is a player with 0 USDC, 1000 rating, 0 games played, 0 wins, 0 losses, and 0 draws.
 */
const charlie: Player = {
    address: mnemonicToAccount(mnemonic, { accountIndex: 2 }).address,
    balance: parseUnits("0", token.decimals).toString(),
    rating: 1000,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
};

/**
 * David is a player with 10000 USDC, 2757 rating, 12 games played, 9 wins, 0 losses, and 3 draws.
 */
const david: Player = {
    address: mnemonicToAccount(mnemonic, { accountIndex: 3 }).address,
    balance: parseUnits("10000", token.decimals).toString(),
    rating: 2757,
    games: 12,
    wins: 9,
    losses: 0,
    draws: 3,
};

/**
 * Eve is a player with 9000000 USDC, 930 rating, 22 games played, 4 wins, 15 losses, and 3 draws.
 */
const eve: Player = {
    address: mnemonicToAccount(mnemonic, { accountIndex: 4 }).address,
    balance: parseUnits("9000000", token.decimals).toString(),
    rating: 930,
    games: 22,
    wins: 4,
    losses: 15,
    draws: 3,
};

export { alice, bob, charlie, david, eve };
