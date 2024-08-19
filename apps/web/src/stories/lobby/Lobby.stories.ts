import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { parseUnits } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { Lobby } from "../../components/play/Lobby";
import { token } from "../config";
import { alice, bob } from "../players";
import * as Challenge from "./Challenge.stories";

const meta = {
    title: "Lobby/Lobby",
    component: Lobby,
} satisfies Meta<typeof Lobby>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Math.floor(Date.now() / 1000);
const randomAddress = (accountIndex: number) =>
    mnemonicToAccount(
        "test test test test test test test test test test junk junk",
        { accountIndex },
    ).address;

export const Empty: Story = {
    args: {
        executing: false,
        lobby: [],
        onCancel: fn(),
        onConnect: fn(),
        onCreate: fn(),
        onDeposit: fn(),
        onJoin: fn(),
        players: {},
        token,
    },
};

export const EmptyConnected: Story = {
    args: { ...Empty.args, player: alice },
};

export const Waiting: Story = {
    args: {
        executing: false,
        lobby: [
            {
                address: randomAddress(0),
                bet: parseUnits("1", token.decimals).toString(),
                createdAt: now,
                maxRating: 1400,
                minRating: 900,
                player: bob.address,
                timeControl: "1500",
            },
            {
                address: randomAddress(1),
                bet: parseUnits("1", token.decimals).toString(),
                createdAt: now,
                maxRating: 1400,
                minRating: 900,
                player: alice.address,
                timeControl: "1500",
            },
        ],
        onCancel: fn(),
        onCreate: fn(),
        onConnect: fn(),
        onDeposit: fn(),
        onJoin: fn(),
        player: alice,
        players: {
            [alice.address]: alice,
            [bob.address]: bob,
        },
        token,
    },
};

export const Default: Story = {
    args: {
        executing: false,
        lobby: [
            Challenge.Default.args.challenge,
            Challenge.Expert.args.challenge,
            Challenge.InsufficientBalance.args.challenge,
        ],
        onCancel: fn(),
        onCreate: fn(),
        onConnect: fn(),
        onDeposit: fn(),
        onJoin: fn(),
        player: bob,
        players: {
            [Challenge.Default.args.challenge.player]:
                Challenge.Default.args.challenger,
        },
        token,
    },
};
