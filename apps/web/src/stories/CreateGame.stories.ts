import { Token, createPlayer } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { CreateGame } from "../components/CreateGame";

const meta = {
    title: "CreateGame",
    component: CreateGame,
    tags: ["autodocs"],
} satisfies Meta<typeof CreateGame>;

export default meta;
type Story = StoryObj<typeof meta>;

const token: Token = {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
};

export const Disconnected: Story = {
    args: {
        executing: false,
        onCreate: fn(),
        onConnect: fn(),
        onDeposit: fn(),
        token,
    },
};

export const Connected: Story = {
    args: {
        executing: false,
        onCreate: fn(),
        onDeposit: fn(),
        player: createPlayer("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
        token,
    },
};

export const Balance3: Story = {
    args: {
        executing: false,
        onCreate: fn(),
        onDeposit: fn(),
        player: {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: (3n * 10n ** 6n).toString(),
            draws: 0,
            losses: 0,
            played: 0,
            rating: 1000,
            wins: 0,
        },
        token,
    },
};

export const Error: Story = {
    args: {
        executing: false,
        error: `The paymaster simulated the user operation to estimate the gas cost and found that the execution will revert.

To troubleshoot this error, we recommend double-checking the logic that you used to create the user operation's callData. If you are batching calls, test each call separately to identify the culprit. If you are unable to quickly identify the issue, you may need to simulate the user operation.`,
        onCreate: fn(),
        onDeposit: fn(),
        player: {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: (3n * 10n ** 6n).toString(),
            draws: 0,
            losses: 0,
            played: 0,
            rating: 1000,
            wins: 0,
        },
        token,
    },
};
