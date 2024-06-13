import type { Meta, StoryObj } from "@storybook/react";
import { Clock } from "../components/Clock";

const meta = {
    title: "Clock",
    component: Clock,
    tags: ["autodocs"],
} satisfies Meta<typeof Clock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
    args: {
        active: true,
        secondsRemaining: 280,
        startTime: Math.floor(Date.now() / 1000),
    },
};

export const Inactive: Story = {
    args: {
        active: false,
        secondsRemaining: 195,
        startTime: Math.floor(Date.now() / 1000),
    },
};

export const Over: Story = {
    args: {
        active: false,
        secondsRemaining: 0,
        startTime: Math.floor(Date.now() / 1000),
    },
};

export const RunningOut: Story = {
    args: {
        active: true,
        secondsRemaining: 13,
        startTime: Math.floor(Date.now() / 1000),
    },
};

export const StartedInThePast: Story = {
    args: {
        active: true,
        secondsRemaining: 140,
        startTime: Math.floor(Date.now() / 1000) - 120,
    },
};

export const OverInThePast: Story = {
    args: {
        active: true,
        secondsRemaining: 20,
        startTime: Math.floor(Date.now() / 1000) - 120,
    },
};

export const Big: Story = {
    args: {
        active: true,
        secondsRemaining: 230,
        size: "xl",
        startTime: Math.floor(Date.now() / 1000),
    },
};
