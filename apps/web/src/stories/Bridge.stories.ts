import { Token } from "@onchess/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Bridge } from "../components/Bridge";

const meta = {
    title: "Bridge",
    component: Bridge,
    tags: ["autodocs"],
} satisfies Meta<typeof Bridge>;

export default meta;
type Story = StoryObj<typeof meta>;

const token: Token = {
    address: "0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2",
    decimals: 18,
    name: "Test",
    symbol: "TEST",
};

const amount = (amount: number): string =>
    (BigInt(amount) * 10n ** BigInt(token.decimals)).toString();

export const Default: Story = {
    args: {
        allowance: amount(1000000000),
        applicationBalance: amount(10),
        balance: amount(120),
        disabled: false,
        executing: false,
        onApprove: fn(),
        onDeposit: fn(),
        onWithdraw: fn(),
        token,
    },
};

export const Disabled: Story = {
    args: {
        allowance: amount(1000000000),
        applicationBalance: amount(10),
        balance: amount(120),
        disabled: true,
        executing: false,
        onApprove: fn(),
        onDeposit: fn(),
        onWithdraw: fn(),
        token,
    },
};

export const NoBalance: Story = {
    args: {
        allowance: "0",
        applicationBalance: "0",
        balance: "0",
        disabled: false,
        executing: false,
        onApprove: fn(),
        onDeposit: fn(),
        onWithdraw: fn(),
        token,
    },
};

export const NoAllowance: Story = {
    args: {
        allowance: "0",
        applicationBalance: "0",
        balance: amount(120),
        disabled: false,
        executing: false,
        onApprove: fn(),
        onDeposit: fn(),
        onWithdraw: fn(),
        token,
    },
};

export const Executing: Story = {
    args: {
        allowance: amount(1000000000),
        applicationBalance: amount(10),
        balance: amount(120),
        disabled: false,
        executing: true,
        onApprove: fn(),
        onDeposit: fn(),
        onWithdraw: fn(),
        token,
    },
};
