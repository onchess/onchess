import { Token } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Vouchers } from "../../components/bridge/Vouchers";

const meta = {
    title: "Bridge/Vouchers",
    component: Vouchers,
    tags: ["autodocs"],
} satisfies Meta<typeof Vouchers>;

export default meta;
type Story = StoryObj<typeof meta>;

const token: Token = {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
};

export const NoVouchers: Story = {
    args: {
        onExecute: fn(),
        token,
        vouchers: [],
    },
};
