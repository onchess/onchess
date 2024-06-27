import { Voucher } from "@deroll/core";
import { Address, Hex, decodeFunctionData, erc20Abi } from "viem";

export const destination = (token: Address) => (voucher: Voucher) =>
    voucher.destination === token;

export const transferTo = (recipient: Address) => (voucher: Voucher) => {
    try {
        const { functionName, args } = decodeFunctionData({
            abi: erc20Abi,
            data: voucher.payload as Hex,
        });
        if (functionName === "transfer") {
            const [to] = args;
            return to === recipient;
        } else if (functionName === "transferFrom") {
            const [_, to] = args;
            return to === recipient;
        }
    } catch (e: any) {
        return false;
    }
    return false;
};
