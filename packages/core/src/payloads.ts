import { RequestMetadata } from "@deroll/core";
import { Address } from "viem";

/**
 * Base payload contains metadata of a Cartesi rollups request
 */
export interface BasePayload {
    metadata: RequestMetadata;
}

/**
 * Lobby item payload
 */
export interface LobbyBasePayload extends BasePayload {
    address: Address;
}

/**
 * Game payload adds the address of a game
 */
export interface GameBasePayload extends BasePayload {
    address: Address;
}

/**
 * Move piece payload adds a move to a game
 */
export interface MovePiecePayload extends GameBasePayload {
    move: string;
}

/**
 * Create game payload has a game configuration and bet
 */
export interface CreateGamePayload extends BasePayload {
    bet: string;
    timeControl: string;
    minRating: number;
    maxRating: number;
}

/**
 * Deposit payload represents a ERC-20 deposit
 */
export interface DepositPayload extends BasePayload {
    amount: string;
    sender: Address;
}

/**
 * Withdraw payload represents a ERC-20 withdraw
 */
export interface WithdrawPayload extends BasePayload {
    amount: string;
}

/**
 * Transfer ownership payload
 */
export interface TransferOwnershipPayload extends BasePayload {
    newOwner: Address;
}

/**
 * Payload to change rake divider
 */
export interface SetRakeDividerPayload extends BasePayload {
    value: number;
}

/**
 * Payload to export game state to anothe dapp
 */
export interface ExportPayload extends BasePayload {
    dapp: Address;
}
