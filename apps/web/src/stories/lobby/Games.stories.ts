import type { Meta, StoryObj } from "@storybook/react";

import { Games } from "../../components/Games";
import { token } from "../config";
import full from "../full";

const meta: Meta<typeof Games> = {
    title: "Gameplay/Games",
    component: Games,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Games>;

export const Disconnected: Story = {
    args: {
        games: full.games,
        now: 1712250000,
        token,
    },
};

export const Connected: Story = {
    args: {
        account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        games: full.games,
        now: 1712250000,
        token,
    },
};
