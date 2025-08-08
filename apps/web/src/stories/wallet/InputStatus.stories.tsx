import type { Meta, StoryObj } from "@storybook/react";
import { InputStatus } from "../../components/wallet/InputStatus";

const meta = {
    title: "Connect/InputStatus",
    component: InputStatus,
    tags: ["autodocs"],
} satisfies Meta<typeof InputStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithMessage: Story = {
    args: {
        inputIndex: 5n,
        message: "Creating game...",
    },
};

export const WithoutMessage: Story = {
    args: {
        inputIndex: 5n,
    },
};
