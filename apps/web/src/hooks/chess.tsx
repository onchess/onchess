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
import { useAtomicSupport, usePaymasterServiceSupport } from "./capabilities";

export const useChessActions = (paymasterUrl?: string) => {
    const { sendCallsAsync, isPending } = useSendCalls();
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const { supported: atomicSupported } = useAtomicSupport();
    const capabilities: WalletCapabilities = {};
    if (paymasterSupported && paymasterUrl) {
        capabilities.paymasterService = { url: paymasterUrl };
    }

    const createGameAsync = async (
        application: Address,
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

    const sendMoveAsync = async (
        application: Address,
        params: Omit<MovePiecePayload, "sender" | "metadata">,
    ) => {
        const { address, move } = params;
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "move",
            args: [address, move],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
            capabilities,
        });
    };

    const resignAsync = async (
        application: Address,
        params: Omit<GameBasePayload, "metadata">,
    ) => {
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
        application: Address,
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
        claimVictoryAsync,
        createGameAsync,
        isPending,
        resignAsync,
        sendMoveAsync,
    };
};
