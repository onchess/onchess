"use client";

import { Badge, Button, Group, Stack } from "@mantine/core";
import { Game, GameBasePayload, MovePiecePayload, Player } from "@onchess/core";
import { Position } from "chess-fen";
import { Chess } from "chess.js";
import { FC, useState } from "react";
import {
    BoardTheme,
    ChessBoard,
    ChessBoardDndProvider,
    MoveHandler,
    PromotionView,
    SquareRendererFunc,
    defaultRenderSquare,
} from "react-fen-chess-board";
import { getTimeLeft } from "../hooks/clock";
import { Clock } from "./Clock";
import { PlayerText } from "./PlayerText";

export type GameboardProps = {
    game: Game;
    now: number;
    onClaimVictory: (params: Omit<GameBasePayload, "metadata">) => void;
    onMove: (params: Omit<MovePiecePayload, "metadata" | "sender">) => void;
    onResign: (params: Omit<GameBasePayload, "metadata">) => void;
    player?: Player; // optional, so we can support "expectators"
};

export interface Promotion {
    from: Position;
    to: Position;
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
}

export const Gameboard: FC<GameboardProps> = ({
    game,
    now,
    onClaimVictory,
    onMove,
    onResign,
    player,
}) => {
    // create a Chess instance and load the PGN
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    const gameover = chess.isGameOver();
    const draw = chess.isDraw();
    const turn = chess.turn();
    const result = draw ? 0.5 : gameover ? (turn === "w" ? 0 : 1) : undefined;

    const rotated = player?.address === game.black;
    const whiteTurn =
        player?.address === game.white && turn === "w" && result == undefined;
    const blackTurn =
        player?.address === game.black && turn === "b" && result == undefined;
    const playerTurn = whiteTurn || blackTurn;

    const [promotion, setPromotion] = useState<Promotion | null>(null);
    const fen = chess.fen();

    // flag that indicates if white player can claim vitory
    const whiteTimeLeft = getTimeLeft(
        now,
        game.whiteTime,
        game.updatedAt,
        turn === "w",
    );
    const blackTimeLeft = getTimeLeft(
        now,
        game.blackTime,
        game.updatedAt,
        turn === "b",
    );
    const whiteClaimVictory =
        player?.address === game.white &&
        turn === "b" &&
        !chess.isGameOver() &&
        blackTimeLeft === 0;
    const blackClaimVictory =
        player?.address === game.black &&
        turn === "w" &&
        !chess.isGameOver() &&
        whiteTimeLeft === 0;

    const whiteWin = result == 1;
    const blackWin = result == 0;
    // players addresses
    const whiteAddress = (
        <Group justify="space-between">
            <PlayerText address={game.white} color="w" isTurn={whiteTurn} />
            {whiteTurn && (
                <Button
                    onClick={() => onResign({ address: game.address })}
                    size="xs"
                >
                    Resign
                </Button>
            )}
            {whiteClaimVictory && (
                <Button
                    onClick={() => onClaimVictory({ address: game.address })}
                >
                    Claim Victory
                </Button>
            )}
            {whiteWin && (
                <Badge bg="yellow" size="lg">
                    Winner
                </Badge>
            )}
            <Clock
                active={turn === "w" && result === undefined}
                now={now}
                size="lg"
                secondsRemaining={game.whiteTime}
                startTime={game.updatedAt}
            />
        </Group>
    );
    const blackAddress = (
        <Group justify="space-between">
            <PlayerText address={game.black} color="b" isTurn={blackTurn} />
            {blackTurn && (
                <Button
                    onClick={() => onResign({ address: game.address })}
                    size="xs"
                >
                    Resign
                </Button>
            )}
            {blackClaimVictory && (
                <Button
                    onClick={() => onClaimVictory({ address: game.address })}
                >
                    Claim Victory
                </Button>
            )}
            {blackWin && (
                <Badge bg="yellow" size="lg">
                    Winner
                </Badge>
            )}
            <Clock
                active={turn === "b" && result === undefined}
                now={now}
                size="lg"
                secondsRemaining={game.blackTime}
                startTime={game.updatedAt}
            />
        </Group>
    );

    // change default board theme
    const boardTheme: BoardTheme = {
        darkSquare: "#b58863",
        lightSquare: "#f0d9b5",
    };

    // this is the move handler that will be called when a move is made
    const moveHandler: MoveHandler = (props) => {
        const { fromPosition, toPosition, board } = props;

        if (board.isPromotion(fromPosition, toPosition)) {
            setPromotion({
                from: fromPosition,
                to: toPosition,
            });
            return;
        }

        try {
            const move = chess.move({
                from: fromPosition.toCoordinate(),
                to: toPosition.toCoordinate(),
            });
            onMove({ address: game.address, move: move.san });
        } catch (error) {
            console.warn(getErrorMessage(error));
        }
    };

    // render square function that is able to handle promotions
    const renderSquare: SquareRendererFunc = (props) => {
        if (promotion && promotion.to.equals(props.position)) {
            return (
                <PromotionView
                    key={props.position.toCoordinate()}
                    onClose={() => setPromotion(null)}
                    onPromotion={(piece) => {
                        const move = chess.move({
                            from: promotion.from.toCoordinate(),
                            to: promotion.to.toCoordinate(),
                            promotion: piece.toLowerCase(),
                        });
                        onMove({
                            address: game.address,
                            move: move.san,
                        });
                        setPromotion(null);
                    }}
                    {...props}
                />
            );
        }

        return defaultRenderSquare(props);
    };

    return (
        <Stack miw={600}>
            {!rotated && blackAddress}
            {rotated && whiteAddress}
            <ChessBoardDndProvider>
                <ChessBoard
                    fen={fen}
                    rotated={rotated}
                    boardTheme={boardTheme}
                    onMove={playerTurn ? moveHandler : undefined}
                    renderSquare={renderSquare}
                />
            </ChessBoardDndProvider>
            {rotated && blackAddress}
            {!rotated && whiteAddress}
        </Stack>
    );
};
