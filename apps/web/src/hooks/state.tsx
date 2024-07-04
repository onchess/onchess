import { QueryResult, useQuery } from "@apollo/client";
import { State } from "@onchess/core";
import { useEffect, useState } from "react";
import { Hex, hexToString } from "viem";
import {
    CompletionStatus,
    Exact,
    InputNoticeDocument,
    InputNoticeQuery,
    LatestInputNumberDocument,
} from "../__generated__/graphql";
import { extractChain } from "../providers/wallet";
import { getConfig } from "../util/config";

export type StateResponse = QueryResult<
    InputNoticeQuery,
    Exact<{
        inputIndex: number;
        noticeIndex: number;
    }>
> & {
    inputIndex?: number;
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
        lobby: [],
        players: {},
        vouchers: [],
        isShutdown: false,
    });

    // query for latest input (number and status), with polling
    const { data: latestInput } = useQuery(LatestInputNumberDocument, {
        pollInterval,
    });

    const inputIndex = latestInput?.inputs.edges[0].node.index;
    const inputStatus = latestInput?.inputs.edges[0].node.status;

    // query for notice when inputIndex changes (only for processed inputs)
    const query = useQuery(InputNoticeDocument, {
        variables: {
            inputIndex: inputIndex!,
            noticeIndex: 0,
        },
        skip:
            inputIndex === undefined ||
            inputStatus === CompletionStatus.Unprocessed,
    });
    const { data } = query;

    useEffect(() => {
        // get first notice
        const notice = data?.input?.notice;

        if (notice) {
            // hex string of notice
            const hex = notice.payload as Hex;

            // convert hex string string
            const str = hexToString(hex);

            if (str) {
                // parse JSON
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
                    lobby: [],
                    players: {},
                    vouchers: [],
                    isShutdown: false,
                });
            }
        }
    }, [chain.id, data]); // trigger effect when inputIndex+status changes

    return { ...query, inputIndex, state };
};
