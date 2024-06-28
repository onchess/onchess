import { QueryResult, gql, useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import { getContract } from "viem";
import { usePublicClient } from "wagmi";
import {
    Exact,
    ExecutableVoucherFragment,
    GetVouchersQuery,
    GetVouchersQueryVariables,
} from "../__generated__/graphql";
import { useApplicationAddress } from "./config";
import { cartesiDAppAbi } from "./contracts";

const VOUCHERS = gql(/* GraphQL */ `
    fragment ExecutableVoucher on Voucher {
        index
        input {
            blockNumber
            index
            timestamp
        }
        destination
        payload
        proof {
            validity {
                inputIndexWithinEpoch
                outputIndexWithinInput
                outputHashesRootHash
                vouchersEpochRootHash
                noticesEpochRootHash
                machineStateHash
                outputHashInOutputHashesSiblings
                outputHashesInEpochSiblings
            }
            context
        }
    }
    query getVouchers($numVouchers: Int!, $cursor: String) {
        vouchers(first: $numVouchers, after: $cursor) {
            pageInfo {
                endCursor
                hasNextPage
            }
            edges {
                cursor
                node {
                    ...ExecutableVoucher
                }
            }
        }
    }
`);

export type VouchersResponse = QueryResult<
    GetVouchersQuery,
    Exact<{
        [key: string]: never;
    }>
>;

export type ExecutableVoucher = ExecutableVoucherFragment & {
    executable: boolean;
    executed: boolean;
};

export type UseVouchersResponse = {
    loading: boolean;
    data: ExecutableVoucher[];
};

export const useVouchers = (): UseVouchersResponse => {
    const applicationAddress = useApplicationAddress();
    const publicClient = usePublicClient();

    const client = useApolloClient();
    const [data, setData] = useState<ExecutableVoucher[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        const pageSize = 50;
        let hasNextPage = true;
        let variables: GetVouchersQueryVariables = {
            cursor: null,
            numVouchers: pageSize,
        };
        let results: ExecutableVoucherFragment[] = [];
        while (hasNextPage) {
            console.log(`fetching vouchers with cursor ${variables.cursor}`);
            const { data } = await client.query<GetVouchersQuery>({
                query: VOUCHERS,
                variables,
            });

            // append data
            const vouchers = data.vouchers.edges.map(({ node }) => node);
            results = [...results, ...vouchers];

            console.log(data);
            hasNextPage = data.vouchers.pageInfo.hasNextPage;
            variables = {
                cursor: data.vouchers.pageInfo.endCursor,
                numVouchers: pageSize,
            };
            // go to next page
        }
        setLoading(false);

        // query blockchain for execution status of each voucher
        // TODO: this is bad
        const vouchers: ExecutableVoucher[] = await Promise.all(
            results.map(async (voucher) => {
                let executed = false;
                if (applicationAddress && publicClient && voucher.proof) {
                    const contract = getContract({
                        abi: cartesiDAppAbi,
                        address: applicationAddress,
                        client: publicClient,
                    });
                    executed = await contract.read.wasVoucherExecuted([
                        BigInt(voucher.input.index),
                        BigInt(voucher.index),
                    ]);
                }
                return {
                    ...voucher,
                    executable: voucher.proof !== null && !executed,
                    executed,
                };
            }),
        );

        setData(vouchers);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    return {
        data,
        loading,
    };
};
