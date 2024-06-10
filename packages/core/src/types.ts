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
export interface AppConfig {
    token: Token; // ERC-20 token used
    rakeDivider: bigint; // amount of the bet that goes to the house, i.e. 20n represents 5%, 10n represents 10%
}
