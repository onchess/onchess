import {
    ABI,
    type CreateGamePayload,
    type GameBasePayload,
    type MovePiecePayload,
} from "@onchess/core";
import {
    type Address,
    type WalletCapabilities,
    encodeFunctionData,
} from "viem";
import { useSendCalls } from "wagmi";
import { createAddInputCall } from "../calls";
import { usePaymasterServiceSupport } from "./capabilities";

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
        const { bet, timeControl, minRating, maxRating } = params;
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "create",
            args: [
                BigInt(bet),
                timeControl,
                Math.ceil(minRating),
                Math.floor(maxRating),
            ],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
            capabilities,
        });
    };

    const cancelGameAsync = async (
        params: Omit<GameBasePayload, "metadata">,
    ) => {
        const { address } = params;
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "cancel",
            args: [address],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
            capabilities,
        });
    };

    const joinGameAsync = async (params: Omit<GameBasePayload, "metadata">) => {
        const { address } = params;
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "join",
            args: [address],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
            capabilities,
        });
    };

    const sendMoveAsync = async (
        params: Omit<MovePiecePayload, "sender" | "metadata">,
        sessionId?: string,
    ) => {
        const { address, move } = params;
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "move",
            args: [address, move],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
            capabilities: {
                ...capabilities,
                permissions: { sessionId },
            },
        });
    };

    const resignAsync = async (params: Omit<GameBasePayload, "metadata">) => {
        const { address } = params;
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "resign",
            args: [address],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
            capabilities,
        });
    };

    const claimVictoryAsync = async (
        params: Omit<GameBasePayload, "metadata">,
    ) => {
        const { address } = params;
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "claim",
            args: [address],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
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
