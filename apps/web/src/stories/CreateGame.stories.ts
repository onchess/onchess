import { createPlayer } from "@onchess/core";
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

const now = Math.floor(Date.now() / 1000);

export const Disconnected: Story = {
    args: {
        decimals: 18,
        symbol: "TEST",
        onCreate: fn(),
        onDeposit: fn(),
    },
};

export const Connected: Story = {
    args: {
        decimals: 18,
        symbol: "TEST",
        onCreate: fn(),
        onDeposit: fn(),
        player: createPlayer("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
    },
};

export const Balance80: Story = {
    args: {
        decimals: 18,
        symbol: "TEST",
        onCreate: fn(),
        onDeposit: fn(),
        player: {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: (80n * 10n ** 18n).toString(),
            draws: 0,
            losses: 0,
            played: 0,
            rating: 1000,
            wins: 0,
        },
    },
};
