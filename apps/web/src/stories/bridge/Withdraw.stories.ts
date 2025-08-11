import type { Token } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { encodeFunctionData, erc20Abi, parseUnits, zeroHash } from "viem";
import { Withdraw } from "../../components/bridge/Withdraw";

const meta = {
    title: "Bridge/Withdraw",
    component: Withdraw,
    tags: ["autodocs"],
} satisfies Meta<typeof Withdraw>;

export default meta;
type Story = StoryObj<typeof meta>;

const token: Token = {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
};

export const Default: Story = {
    args: {
        applicationBalance: "800000",
        connecting: false,
        disabled: false,
        executing: false,
        initialAmount: undefined,
        onConnect: fn(),
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const ZeroBalance: Story = {
    args: {
        applicationBalance: "0",
        connecting: false,
        disabled: false,
        executing: false,
        initialAmount: undefined,
        onConnect: fn(),
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const InitialAmount: Story = {
    args: {
        applicationBalance: "800000",
        connecting: false,
        disabled: false,
        executing: false,
        initialAmount: "250000",
        onConnect: fn(),
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const Executing: Story = {
    args: {
        applicationBalance: "800000",
        connecting: false,
        disabled: false,
        executing: true,
        initialAmount: "250000",
        onConnect: fn(),
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const Disabled: Story = {
    args: {
        applicationBalance: "800000",
        connecting: false,
        disabled: true,
        executing: false,
        initialAmount: "250000",
        onConnect: fn(),
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const Vouchers: Story = {
    args: {
        applicationBalance: "800000",
        connecting: false,
        disabled: false,
        executing: false,
        initialAmount: "250000",
        onConnect: fn(),
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [
            {
                createdAt: new Date(),
                decodedData: {
                    destination: token.address,
                    type: "Voucher",
                    payload: encodeFunctionData({
                        abi: erc20Abi,
                        functionName: "transfer",
                        args: [
                            "0xD27A20A18496AE3200358E569B107D62a1e3f463",
                            parseUnits("7.2", token.decimals),
                        ],
                    }),
                    value: 0n,
                },
                epochIndex: 0n,
                executable: false,
                executed: false,
                executionTransactionHash: null,
                hash: zeroHash,
                index: 0n,
                inputIndex: 0n,
                outputHashesSiblings: [],
                rawData: "0x",
                updatedAt: new Date(),
            },
        ],
    },
};
