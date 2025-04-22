import { Token } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { WithdrawVoucher } from "../../components/bridge/WithdrawVoucher";
import { ExecutableVoucher } from "../../hooks/voucher";

const meta = {
    title: "Bridge/WithdrawVoucher",
    component: WithdrawVoucher,
    tags: ["autodocs"],
} satisfies Meta<typeof WithdrawVoucher>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);

const token: Token = {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
};

const amount = parseUnits("7.2", token.decimals);
const payload = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: ["0xD27A20A18496AE3200358E569B107D62a1e3f463", amount],
});

const voucher: ExecutableVoucher = {
    createdAt: new Date(now),
    decodedData: {
        type: "Voucher",
        destination: token.address,
        payload,
        value: amount,
    },
    epochIndex: 0n,
    executable: false,
    executed: false,
    executionTransactionHash: null,
    hash: "0x",
    index: 0n,
    inputIndex: 0n,
    outputHashesSiblings: [],
    rawData: "0x",
    updatedAt: new Date(now),
};

export const Pending: Story = {
    args: {
        executing: false,
        onExecute: fn(),
        token,
        voucher,
    },
};

export const Executable: Story = {
    args: {
        executing: false,
        onExecute: fn(),
        token,
        voucher: {
            ...voucher,
            executable: true,
        },
    },
};

export const Executed: Story = {
    args: {
        executing: false,
        onExecute: fn(),
        token,
        voucher: {
            ...voucher,
            executed: true,
        },
    },
};

export const Executing: Story = {
    args: {
        executing: true,
        onExecute: fn(),
        token,
        voucher: {
            ...voucher,
            executable: true,
        },
    },
};
