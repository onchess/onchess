"use client";

import { CartesiProvider as CP } from "@cartesi/wagmi";
import { FC, PropsWithChildren } from "react";

export const CartesiProvider: FC<PropsWithChildren> = ({ children }) => {
    const uri = process.env.NEXT_PUBLIC_CARTESI_RPC_URL;
    if (!uri) {
        throw new Error("Missing NEXT_PUBLIC_CARTESI_RPC_URL");
    }
    return <CP rpcUrl={uri}>{children}</CP>;
};
