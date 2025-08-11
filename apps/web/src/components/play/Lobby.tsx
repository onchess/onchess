"use client";

import { em, Flex, type FlexProps } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type {
    Challenge,
    ChallengeBasePayload,
    CreateGamePayload,
    Player,
    Token,
} from "@onchess/core";
import type { FC } from "react";
import type { Address } from "viem";
import { CreateGame } from "../CreateGame";
import { ChallengeComponent } from "./Challenge";

export type LobbyFilter = Pick<
    Challenge,
    "bet" | "maxRating" | "minRating" | "timeControl"
>;

export interface LobbyProps extends FlexProps {
    executing: boolean;
    lobby: Challenge[];
    onJoin: (params: Omit<ChallengeBasePayload, "metadata">) => void;
    onCancel: (params: Omit<ChallengeBasePayload, "metadata">) => void;
    onConnect?: () => void;
    onCreate: (params: Omit<CreateGamePayload, "metadata">) => void;
    onDeposit: (amount: string) => void;
    player?: Player;
    players: Record<Address, Player>;
    token: Token;
}

export const Lobby: FC<LobbyProps> = (props) => {
    const {
        executing,
        lobby,
        onCancel,
        onConnect,
        onCreate,
        onDeposit,
        onJoin,
        player,
        players,
        token,
        ...flexProps
    } = props;

    const challenges = lobby.sort((a, b) => {
        if (player) {
            // put "my" entries first
            if (a.player === player.address && b.player === player.address) {
                return b.createdAt - a.createdAt;
            }
            if (a.player === player.address) {
                return -1;
            }
            if (b.player === player.address) {
                return 1;
            }
            return b.createdAt - a.createdAt;
        }
        // older entries first
        return b.createdAt - a.createdAt;
    });

    const selfInLobby = challenges.find((c) => c.player === player?.address);

    const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

    return (
        <Flex
            gap="md"
            {...flexProps}
            wrap="wrap"
            direction={isMobile ? "column" : "row"}
        >
            {challenges.map((challenge) => (
                <ChallengeComponent
                    key={challenge.address}
                    executing={executing}
                    challenge={challenge}
                    onCancel={onCancel}
                    onJoin={onJoin}
                    player={player}
                    challenger={players[challenge.player]}
                    token={token}
                />
            ))}
            {!selfInLobby && (
                <CreateGame
                    key="create-game"
                    executing={executing}
                    onConnect={onConnect}
                    onCreate={onCreate}
                    onDeposit={onDeposit}
                    player={player}
                    token={token}
                />
            )}
        </Flex>
    );
};
