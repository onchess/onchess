"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { FC, ReactNode } from "react";

export const GraphQLProvider: FC<{ children: ReactNode[] | ReactNode }> = ({
    children,
}) => {
    const cache = new InMemoryCache();
    const uri = process.env.GRAPHQL_URL || "http://localhost:8080/graphql";
    const client = new ApolloClient({ uri, cache });
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
