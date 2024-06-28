import { Token } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
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
        disabled: false,
        executing: false,
        initialAmount: undefined,
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const ZeroBalance: Story = {
    args: {
        applicationBalance: "0",
        disabled: false,
        executing: false,
        initialAmount: undefined,
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const InitialAmount: Story = {
    args: {
        applicationBalance: "800000",
        disabled: false,
        executing: false,
        initialAmount: "250000",
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const Executing: Story = {
    args: {
        applicationBalance: "800000",
        disabled: false,
        executing: true,
        initialAmount: "250000",
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const Disabled: Story = {
    args: {
        applicationBalance: "800000",
        disabled: true,
        executing: false,
        initialAmount: "250000",
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [],
    },
};

export const Vouchers: Story = {
    args: {
        applicationBalance: "800000",
        disabled: false,
        executing: false,
        initialAmount: "250000",
        onExecuteVoucher: fn(),
        onWithdraw: fn(),
        token,
        vouchers: [
            /*            {
                destination: token.address,
                index: 0,
                proof: undefined,
                payload:
                    "0xa9059cbb0000000000000000000000000769e15f8d7042969aeb78e73b54192b3c4ec8bc00000000000000000000000000000000000000000000000000000000007270e0",
            },
            {
                destination: token.address,
                payload:
                    "0xa9059cbb0000000000000000000000000769e15f8d7042969aeb78e73b54192b3c4ec8bc00000000000000000000000000000000000000000000000000000000007270e0",
            },*/
        ],
    },
};
