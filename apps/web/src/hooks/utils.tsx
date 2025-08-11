import type { InputAdded } from "@cartesi/viem";
import { inputBoxAbi } from "@cartesi/viem/abi";
import { useEffect, useState } from "react";
import { type GetCallsStatusReturnType, parseEventLogs } from "viem";
import { useSendCalls, useWaitForCallsStatus } from "wagmi";

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
