import type {
    CreateGamePayload,
    GameBasePayload,
    MovePiecePayload,
} from "@onchess/core";
import type { Address, WalletCapabilities } from "viem";
import {
    createCancelGameCall,
    createClaimVictoryCall,
    createCreateGameCall,
    createJoinGameCall,
    createResignCall,
    createSendMoveCall,
} from "../calls";
import { usePaymasterServiceSupport } from "./capabilities";
import { useSendCartesiCalls } from "./utils";

export const useChessActions = (
    application?: Address,
    paymasterUrl?: string,
) => {
    const { calls, callsStatus, inputs } = useSendCartesiCalls();
    const { sendCalls } = calls;
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const capabilities: WalletCapabilities = {};
    if (paymasterSupported && paymasterUrl) {
        capabilities.paymasterService = { url: paymasterUrl };
    }

    if (!application) {
        return {
            calls,
            callsStatus,
            inputs,
            cancelGame: undefined,
            claimVictory: undefined,
            createGame: undefined,
            joinGame: undefined,
            resign: undefined,
            sendMove: undefined,
        };
    }

    const createGame = (params: Omit<CreateGamePayload, "metadata">) =>
        sendCalls({
            calls: [createCreateGameCall(application, params)],
            capabilities,
        });

    const cancelGame = (params: Omit<GameBasePayload, "metadata">) =>
        sendCalls({
            calls: [createCancelGameCall(application, params)],
            capabilities,
        });

    const joinGame = (params: Omit<GameBasePayload, "metadata">) =>
        sendCalls({
            calls: [createJoinGameCall(application, params)],
            capabilities,
        });

    const sendMove = (
        params: Omit<MovePiecePayload, "sender" | "metadata">,
        sessionId?: string,
    ) =>
        sendCalls({
            calls: [createSendMoveCall(application, params)],
            capabilities: {
                ...capabilities,
                permissions: { sessionId },
            },
        });

    const resign = (params: Omit<GameBasePayload, "metadata">) =>
        sendCalls({
            calls: [createResignCall(application, params)],
            capabilities,
        });

    const claimVictory = (params: Omit<GameBasePayload, "metadata">) =>
        sendCalls({
            calls: [createClaimVictoryCall(application, params)],
            capabilities,
        });

    return {
        calls,
        callsStatus,
        inputs,
        cancelGame,
        claimVictory,
        createGame,
        joinGame,
        resign,
        sendMove,
    };
};
