import {
    Badge,
    Box,
    Group,
    LoadingOverlay,
    Stack,
    ThemeIcon,
} from "@mantine/core";
import { LobbyItem, Token } from "@onchess/core";
import { IconClock, IconCoin, IconStar } from "@tabler/icons-react";
import { Chess } from "chess.js";
import { FC } from "react";
import { BoardTheme, ChessBoard } from "react-fen-chess-board";
import { formatAmount, formatTimeControl } from "../util/format";
import { AddressText } from "./AddressText";

export interface WaitOpponentProps {
    lobby: LobbyItem;
    token: Token;
}

export const WaitOpponent: FC<WaitOpponentProps> = (props) => {
    const { lobby, token } = props;
    const chess = new Chess();
    const fen = chess.fen();

    // change default board theme
    const boardTheme: BoardTheme = {
        darkSquare: "#b58863",
        lightSquare: "#f0d9b5",
    };

    return (
        <Stack miw={600}>
            <Box pos="relative">
                <LoadingOverlay
                    visible
                    zIndex={1000}
                    overlayProps={{
                        backgroundOpacity: 0.3,
                    }}
                />
                <ChessBoard fen={fen} boardTheme={boardTheme} />
            </Box>
            <Group justify="space-between">
                <AddressText address={lobby.player} fw={600} ff="monospace" />
                <Group gap={3}>
                    <ThemeIcon variant="transparent">
                        <IconCoin />
                    </ThemeIcon>
                    <Badge size="lg" variant="outline">
                        {formatAmount(BigInt(lobby.bet), token)}
                    </Badge>
                </Group>
                <Group gap={3}>
                    <ThemeIcon variant="transparent">
                        <IconStar />
                    </ThemeIcon>
                    <Badge size="lg" variant="outline">
                        {lobby.minRating} - {lobby.maxRating}
                    </Badge>
                </Group>
                <Group gap={3}>
                    <ThemeIcon variant="transparent">
                        <IconClock />
                    </ThemeIcon>
                    <Badge size="lg" variant="outline">
                        {formatTimeControl(lobby.timeControl)}
                    </Badge>
                </Group>
                <Badge color="gray" variant="dot" size="lg">
                    Waiting opponent...
                </Badge>
            </Group>
        </Stack>
    );
};
