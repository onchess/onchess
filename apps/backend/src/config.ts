import { cartesi } from "@cartesi/viem/chains";
import type { Config } from "@onchess/core";
import { base, baseSepolia } from "viem/chains";

const rakeDivider = 20; // (divider) 5%
const eloKFactor = 20;

const configs: Record<number, Config> = {
    [base.id]: {
        eloKFactor,
        rakeDivider,
        owner: "0x6BAd28d4152E1D525C63D413da6DC4f2447d1979", // OnChess DAO
        token: {
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
            decimals: 6,
            name: "USD Coin",
            symbol: "USDC",
        },
    },
    [baseSepolia.id]: {
        eloKFactor,
        rakeDivider,
        owner: "0xD27A20A18496AE3200358E569B107D62a1e3f463", // tuler.eth
        token: {
            address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
            decimals: 6,
            name: "USD Coin",
            symbol: "USDC",
        },
    },
    [cartesi.id]: {
        eloKFactor,
        rakeDivider,
        owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // anvil default account 2
        token: {
            address: "0x88A2120B7068E78692C8fd12E751d610B6377E4d", // TestToken
            decimals: 18,
            name: "Fungible",
            symbol: "FUN",
        },
    },
};

export const getConfig = (chainId: number): Config => {
    const config = configs[chainId];
    if (!config) {
        throw new Error(`Unsupported chain ${chainId}`);
    }
    return config;
};
