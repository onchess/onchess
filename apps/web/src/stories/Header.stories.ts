import { INITIAL_RATING } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Header } from "../components/Header";
import { token } from "./config";

const meta = {
    title: "Header",
    component: Header,
    tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = {
    args: {
        isConnected: false,
        isConnecting: false,
        onConnect: fn(),
        onDisconnect: fn(),
        token,
    },
};

export const Connected: Story = {
    args: {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        isConnected: true,
        isConnecting: false,
        player: {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: (350n * 10n ** BigInt(token.decimals)).toString(),
            games: 1,
            wins: 1,
            losses: 0,
            draws: 0,
            rating: 2310,
        },
        onConnect: fn(),
        onDisconnect: fn(),
        token,
    },
};

export const NoBalance: Story = {
    args: {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        isConnected: true,
        isConnecting: false,
        player: {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: "0",
            games: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            rating: INITIAL_RATING,
        },
        onConnect: fn(),
        onDisconnect: fn(),
        token,
    },
};
