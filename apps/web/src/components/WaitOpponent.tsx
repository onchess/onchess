import {
    Badge,
    Box,
    Group,
    LoadingOverlay,
    Stack,
    Tooltip,
} from "@mantine/core";
import { LobbyItem, Token } from "@onchess/core";
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
                <AddressText address={lobby.player} />
                <Badge size="lg">
                    {formatAmount(BigInt(lobby.bet), token)}
                </Badge>
                <Badge size="lg">
                    {lobby.minRating} - {lobby.maxRating}
                </Badge>
                <Tooltip
                    label={formatTimeControl(lobby.timeControl)}
                    position="bottom"
                >
                    <Badge size="lg">{lobby.timeControl}</Badge>
                </Tooltip>
                <Badge color="gray" variant="dot" size="lg">
                    Waiting opponent...
                </Badge>
            </Group>
        </Stack>
    );
};
