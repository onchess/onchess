import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { parseUnits } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { timeControls } from "../../components/CreateGame";
import { ChallengeComponent } from "../../components/play/Challenge";
import { token } from "../config";
import { alice, bob } from "../players";

const meta = {
    title: "Lobby/Challenge",
    component: ChallengeComponent,
    tags: ["autodocs"],
} satisfies Meta<typeof ChallengeComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);
const randomAddress = (accountIndex: number) =>
    mnemonicToAccount(
        "test test test test test test test test test test junk junk",
        { accountIndex }
    ).address;

export const Default: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(0),
            bet: parseUnits("1", token.decimals).toString(),
            createdAt: now,
            minRating: 800,
            maxRating: 1400,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: bob,
        token,
    },
};

export const Self: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(1),
            bet: parseUnits("1", token.decimals).toString(),
            createdAt: now,
            minRating: 800,
            maxRating: 1400,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: alice,
        token,
    },
};

export const Expert: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(2),
            bet: parseUnits("1", token.decimals).toString(),
            createdAt: now,
            minRating: 1200,
            maxRating: 2000,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: bob,
        token,
    },
};

export const InsufficientBalance: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(3),
            bet: parseUnits("5", token.decimals).toString(),
            createdAt: now,
            minRating: 800,
            maxRating: 1200,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: bob,
        token,
    },
};

export const RatingLowerBound: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(4),
            bet: parseUnits("1", token.decimals).toString(),
            createdAt: now,
            minRating: 900,
            maxRating: Number.MAX_SAFE_INTEGER,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: bob,
        token,
    },
};

export const RatingUpperBound: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(5),
            bet: parseUnits("1", token.decimals).toString(),
            createdAt: now,
            minRating: 0,
            maxRating: 1300,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: bob,
        token,
    },
};

export const FreeRating: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(6),
            bet: parseUnits("1", token.decimals).toString(),
            createdAt: now,
            minRating: 0,
            maxRating: Number.MAX_SAFE_INTEGER,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: bob,
        token,
    },
};

export const NoBet: Story = {
    args: {
        executing: false,
        challenge: {
            address: randomAddress(6),
            bet: "0",
            createdAt: now,
            minRating: 0,
            maxRating: Number.MAX_SAFE_INTEGER,
            player: alice.address,
            timeControl: timeControls[0],
        },
        challenger: alice,
        onCancel: fn(),
        onJoin: fn(),
        player: bob,
        token,
    },
};
