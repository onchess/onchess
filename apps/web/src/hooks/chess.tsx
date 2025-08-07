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
    const { sendCallsAsync, isPending } = useSendCalls();
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const capabilities: WalletCapabilities = {};
    if (paymasterSupported && paymasterUrl) {
        capabilities.paymasterService = { url: paymasterUrl };
    }

    if (!application) {
        return {
            cancelGameAsync: undefined,
            claimVictoryAsync: undefined,
            createGameAsync: undefined,
            joinGameAsync: undefined,
            isPending: false,
            resignAsync: undefined,
            sendMoveAsync: undefined,
        };
    }

    const createGameAsync = async (
        params: Omit<CreateGamePayload, "metadata">,
    ) => {
        return sendCallsAsync({
            calls: [createCreateGameCall(application, params)],
            capabilities,
        });
    };

    const cancelGameAsync = async (
        params: Omit<GameBasePayload, "metadata">,
    ) => {
        return sendCallsAsync({
            calls: [createCancelGameCall(application, params)],
            capabilities,
        });
    };

    const joinGameAsync = async (params: Omit<GameBasePayload, "metadata">) => {
        return sendCallsAsync({
            calls: [createJoinGameCall(application, params)],
            capabilities,
        });
    };

    const sendMoveAsync = async (
        params: Omit<MovePiecePayload, "sender" | "metadata">,
        sessionId?: string,
    ) => {
        return sendCallsAsync({
            calls: [createSendMoveCall(application, params)],
            capabilities: {
                ...capabilities,
                permissions: { sessionId },
            },
        });
    };

    const resignAsync = async (params: Omit<GameBasePayload, "metadata">) => {
        return sendCallsAsync({
            calls: [createResignCall(application, params)],
            capabilities,
        });
    };

    const claimVictoryAsync = async (
        params: Omit<GameBasePayload, "metadata">,
    ) => {
        return sendCallsAsync({
            calls: [createClaimVictoryCall(application, params)],
            capabilities,
        });
    };

    return {
        cancelGameAsync,
        claimVictoryAsync,
        createGameAsync,
        joinGameAsync,
        isPending,
        resignAsync,
        sendMoveAsync,
    };
};
