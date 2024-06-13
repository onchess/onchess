import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "../components/Header";

const meta = {
    title: "Header",
    component: Header,
    tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = {
    args: {
        token: {
            address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
            decimals: 18,
            name: "Test",
            symbol: "TEST",
        },
    },
};

export const Connected: Story = {
    args: {
        player: {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: 350000000000000000000n.toString(),
            played: 1,
            wins: 1,
            losses: 0,
            draws: 0,
            rating: 2310,
        },
        token: {
            address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
            decimals: 18,
            name: "Test",
            symbol: "TEST",
        },
    },
};
