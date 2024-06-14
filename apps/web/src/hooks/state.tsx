import { useQuery } from "@apollo/client";
import { State } from "@onchess/core";
import { Hex, hexToString } from "viem";
import { gql } from "../__generated__";

const LATEST_STATE = gql(/* GraphQL */ `
    query LatestState {
        inputs(last: 1) {
            edges {
                node {
                    index
                    notices(first: 1) {
                        edges {
                            node {
                                payload
                            }
                        }
                    }
                }
            }
        }
    }
`);

export interface StateResponse {
    state?: State;
    loading: boolean;
    error?: string;
}

export const useLatestState = (pollInterval: number = 2000): StateResponse => {
    // query for latest input notice, with polling
    const { data, loading, error } = useQuery(LATEST_STATE, {
        pollInterval,
    });

    if (
        data &&
        data.inputs.edges.length > 0 &&
        data.inputs.edges[0].node.notices.edges.length > 0
    ) {
        // hex string of notice
        const hex = data.inputs.edges[0].node.notices.edges[0].node
            .payload as Hex;

        // convert hex string string
        const str = hexToString(hex);

        if (str) {
            // parse JSON
            const obj = JSON.parse(str);
            const state = obj.chess as State;
            return { loading: false, state };
        }
    }

    return {
        loading,
        error: error?.message,
        state: {
            rake: "0",
            games: {},
            lobby: [],
            players: {},
            vouchers: [],
        },
    };
};
