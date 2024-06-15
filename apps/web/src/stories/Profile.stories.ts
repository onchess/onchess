import { INITIAL_RATING, Token } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Profile } from "../components/Profile";

const meta = {
    title: "Profile",
    component: Profile,
    tags: ["autodocs"],
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

const alice = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const token: Token = {
    address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
    decimals: 18,
    name: "Test",
    symbol: "TEST",
};

export const NewPlayer: Story = {
    args: {
        player: {
            address: alice,
            balance: "0",
            draws: 0,
            losses: 0,
            played: 0,
            rating: INITIAL_RATING,
            wins: 0,
        },
        allowance: "0",
        balance: "0",
        executing: false,
        onApprove: fn(),
        onDeposit: fn(),
        onWithdraw: fn(),
        token,
    },
};
