import { useOutputs, useProcessedInputCount } from "@cartesi/wagmi";
import { State } from "@onchess/core";
import { useEffect, useState } from "react";
import { hexToString } from "viem";
import { extractChain } from "../providers/wallet";
import { getConfig } from "../util/config";
import { useApplicationAddress } from "./config";

export type StateResponse = {
    loading: boolean;
    inputIndex?: bigint;
    state?: State;
};

export const useLatestState = (pollInterval: number = 2000): StateResponse => {
    // default initial state depends on chainId
    const chain = extractChain();

    const [initialized, setInitialized] = useState<boolean>(false);
    const [state, setState] = useState<State>({
        config: getConfig(chain.id),
        rake: "0",
        games: {},
        lobby: {},
        players: {},
        vouchers: [],
        isShutdown: false,
    });

    const application = useApplicationAddress();

    const { data: processedInputCount, refetch } = useProcessedInputCount({
        application,
        refetchInterval: pollInterval,
    });

    const inputIndex = processedInputCount
        ? processedInputCount - 1n
        : undefined;

    const { data: outputs, isLoading } = useOutputs({
        application,
        inputIndex,
        outputType: "Notice",
    });

    useEffect(() => {
        if (outputs && outputs.data.length > 0) {
            const firstNotice = outputs.data[0];
            if (firstNotice.decodedData.type === "Notice") {
                const payload = firstNotice.decodedData.payload;
                const str = hexToString(payload);
                const obj = JSON.parse(str);
                const state = obj.chess as State;
                setState(state);
                setInitialized(true);
            }
        } else {
            // chain changed, but no state was initialized
            if (!initialized) {
                setState({
                    config: getConfig(chain.id),
                    rake: "0",
                    games: {},
                    lobby: {},
                    players: {},
                    vouchers: [],
                    isShutdown: false,
                });
            }
        }
    }, [chain.id, outputs]); // trigger effect when output changes

    return { loading: isLoading, inputIndex, state };
};
