import { ABI, CreateGamePayload } from "@onchess/core";
import { Address, encodeFunctionData, WalletCapabilities } from "viem";
import { useSendCalls } from "wagmi";
import { createAddInputCall } from "../calls";
import {
    useAtomicBatchSupport,
    usePaymasterServiceSupport,
} from "./capabilities";

export const useChessActions = (paymasterUrl?: string) => {
    const { sendCallsAsync, isPending } = useSendCalls();
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const { supported: atomicSupported } = useAtomicBatchSupport();
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
    return { createGameAsync, isPending };
};
