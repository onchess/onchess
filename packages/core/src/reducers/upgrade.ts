import { Voucher } from "@deroll/core";
import { PayloadAction } from "@reduxjs/toolkit";
import {
    Address,
    Hex,
    encodeFunctionData,
    erc20Abi,
    getAddress,
    stringToHex,
} from "viem";
import { erc20PortalAbi, erc20PortalAddress } from "../contracts.js";
import { ExportPayload } from "../payloads.js";
import { State } from "../state.js";

const createERC20DepositVoucher = (
    token: Address,
    dapp: Address,
    amount: bigint,
    execLayerData: Hex,
): Voucher => {
    const call = encodeFunctionData({
        abi: erc20PortalAbi,
        functionName: "depositERC20Tokens",
        args: [token, dapp, amount, execLayerData],
    });

    // create voucher to deposit ERC20 to portal
    return {
        destination: erc20PortalAddress,
        payload: call,
    };
};

const createApproveERC20PortalVoucher = (
    token: Address,
    amount: bigint,
): Voucher => {
    const call = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [erc20PortalAddress, amount],
    });

    // create voucher to approve deposit by erc20PortalAddress
    return {
        destination: token,
        payload: call,
    };
};

/**
 * Calculate the TVL of the application, which is spread around the state
 * @param state app state
 * @returns total value locked in the app
 */
const tvl = (state: State) => {
    let amount = 0n;

    // rake
    amount += BigInt(state.rake);

    // players wallets
    amount += Object.values(state.players).reduce(
        (acc, player) => acc + BigInt(player.balance),
        0n,
    );

    // lobby bets
    amount += Object.values(state.lobby).reduce(
        (acc, item) => acc + BigInt(item.bet),
        0n,
    );

    // games pots
    amount += Object.values(state.games).reduce(
        (acc, game) => acc + BigInt(game.pot),
        0n,
    );

    return amount;
};

export default (state: State, action: PayloadAction<ExportPayload>) => {
    const { payload } = action;
    const { metadata } = payload;
    const { dapp } = payload;
    const token = state.config.token.address;
    const owner = state.config.owner;

    // check permission
    if (getAddress(metadata.msg_sender) !== owner) {
        // only current owner can transfer ownership
        return;
    }

    // serialize state
    const execLayerData = stringToHex(JSON.stringify(state));

    // calculate state TVL
    const amount = tvl(state);

    // create approve voucher
    state.vouchers.push(createApproveERC20PortalVoucher(token, amount));

    // create voucher to deposit (transfer) all funds to another dapp
    // this dapp state is sent as execLayerData
    state.vouchers.push(
        createERC20DepositVoucher(token, dapp, amount, execLayerData),
    );

    // reset state to initial state
    state.games = {};
    state.lobby = {};
    state.players = {};
    state.rake = "0";
};
