import { type Hex, hexToNumber, slice } from "viem";

/**
 * Return a number between 0 and 1 from a hex value.
 * @param value hex value with arbitrary length
 * @returns number between 0 and 1
 */
export const hexToFraction = (value: Hex): number => {
    const l = slice(value, 0, 1);
    const n = hexToNumber(l);
    return n / 256;
};

/**
 * Sum two BigInts as strings.
 * @param v1 BigInt as string
 * @param v2 BigInt as string
 * @returns BigInt(v1) + BigInt(v2) as string
 */
export const sum = (v1: string, v2: string): string => {
    return (BigInt(v1) + BigInt(v2)).toString();
};

/**
 * Subtract two BigInts as strings.
 * @param v1 BigInt as string
 * @param v2 BigInt as string
 * @returns BigInt(v1) - BigInt(v2) as string
 */
export const subtract = (v1: string, v2: string): string => {
    return (BigInt(v1) - BigInt(v2)).toString();
};
