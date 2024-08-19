import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { CreateGame } from "../../components/CreateGame";
import { token } from "../config";
import { bob, charlie } from "../players";

const meta = {
    title: "Lobby/CreateGame",
    component: CreateGame,
    tags: ["autodocs"],
} satisfies Meta<typeof CreateGame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = {
    args: {
        executing: false,
        onCreate: fn(),
        onConnect: fn(),
        onDeposit: fn(),
        token,
    },
};

export const NoBalance: Story = {
    args: {
        executing: false,
        onConnect: fn(),
        onCreate: fn(),
        onDeposit: fn(),
        player: charlie,
        token,
    },
};

export const Balance2: Story = {
    args: {
        executing: false,
        onConnect: fn(),
        onCreate: fn(),
        onDeposit: fn(),
        player: bob,
        token,
    },
};

export const ErrorMessage: Story = {
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
            games: 0,
            rating: 1000,
            wins: 0,
        },
        token,
    },
};
