"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { FC, ReactNode, useMemo } from "react";
import { baseSepolia, foundry } from "viem/chains";
import { useChainId } from "wagmi";

export const GraphQLProvider: FC<{ children: ReactNode[] | ReactNode }> = ({
    children,
}) => {
    const chainId = useChainId();
    const cache = new InMemoryCache();
    const client = useMemo(() => {
        switch (chainId) {
            /*case base.id:
                return new ApolloClient({
                    uri: "http://base.api.onchess.xyz/graphql",
                    cache,
                });*/
            case baseSepolia.id:
                return new ApolloClient({
                    uri: "https://base-sepolia.api.onchess.xyz/graphql",
                    cache,
                });
            case foundry.id:
                return new ApolloClient({
                    uri: "http://localhost:8080/graphql",
                    cache,
                });
            default:
                return new ApolloClient({
                    // uri: "http://base.api.onchess.xyz/graphql", // TODO: change to mainnet when we have it
                    uri: "http://localhost:8080/graphql",
                    cache,
                });
        }
    }, [chainId]);
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
