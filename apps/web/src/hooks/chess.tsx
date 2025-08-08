import type { InputAdded } from "@cartesi/viem";
import { inputBoxAbi } from "@cartesi/viem/abi";
import type {
    CreateGamePayload,
    GameBasePayload,
    MovePiecePayload,
} from "@onchess/core";
import { useEffect, useState } from "react";
import {
    type Address,
    type GetCallsStatusReturnType,
    type WalletCapabilities,
    parseEventLogs,
} from "viem";
import { useSendCalls, useWaitForCallsStatus } from "wagmi";
import {
    createCancelGameCall,
    createClaimVictoryCall,
    createCreateGameCall,
    createJoinGameCall,
    createResignCall,
    createSendMoveCall,
} from "../calls";
import { usePaymasterServiceSupport } from "./capabilities";

const getInputsAdded = (
    call: GetCallsStatusReturnType,
): InputAdded[] | undefined => {
    if (call.receipts !== undefined) {
        const inputs = call.receipts
            .map((receipt) => {
                if (receipt.status === "success") {
                    const parsedLogs = parseEventLogs({
                        abi: inputBoxAbi,
                        eventName: "InputAdded",
                        strict: true,
                        logs: receipt.logs.map((log, index) => ({
                            address: log.address,
                            blockHash: receipt.blockHash,
                            blockNumber: receipt.blockNumber,
                            data: log.data,
                            logIndex: index,
                            removed: false,
                            topics: [log.topics[0], ...log.topics.slice(1)],
                            transactionHash: receipt.transactionHash,
                            transactionIndex: 0,
                        })),
                    });
                    return parsedLogs.map((log) => log.args);
                }
            })
            .filter((inputs) => inputs !== undefined)
            .flat();
        return inputs.length > 0 ? inputs : undefined;
    }
};

export const useSendCartesiCalls = () => {
    const calls = useSendCalls();
    const callsStatus = useWaitForCallsStatus({ id: calls.data?.id });
    const [inputs, setInputs] = useState<InputAdded[]>();

    useEffect(() => {
        if (callsStatus.data) {
            setInputs(getInputsAdded(callsStatus.data));
        }
    }, [callsStatus.data]);

    return { calls, callsStatus, inputs };
};

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
