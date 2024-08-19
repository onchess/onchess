import { ColorSwatch, Group } from "@mantine/core";
import type { Color } from "chess.js";
import type { FC } from "react";
import type { Address } from "viem";
import { AddressText } from "./AddressText";

export type PlayerTextProps = {
    address: Address;
    color: Color;
    isTurn?: boolean;
};

export const PlayerText: FC<PlayerTextProps> = ({ address, color, isTurn }) => {
    return (
        <Group gap={5} wrap="nowrap">
            <ColorSwatch color={color === "w" ? "white" : "black"} size={20} />
            <AddressText
                address={address}
                shorten
                ff="monospace"
                size="sm"
                fw={isTurn === true ? 800 : 200}
            />
        </Group>
    );
};
