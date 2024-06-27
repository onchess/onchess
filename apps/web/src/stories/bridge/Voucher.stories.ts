import { Token } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { Voucher } from "../../components/bridge/Voucher";

const meta = {
    title: "Bridge/Voucher",
    component: Voucher,
    tags: ["autodocs"],
} satisfies Meta<typeof Voucher>;

export default meta;
type Story = StoryObj<typeof meta>;

const token: Token = {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
};

export const Pending: Story = {
    args: {
        destination: token.address,
        payload:
            "0xa9059cbb0000000000000000000000000769e15f8d7042969aeb78e73b54192b3c4ec8bc00000000000000000000000000000000000000000000000000000000007270e0",
        token,
    },
};
