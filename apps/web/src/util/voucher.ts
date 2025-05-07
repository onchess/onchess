import type { Output } from "@cartesi/viem";
import type { iApplicationAbi } from "@cartesi/wagmi";
import type {
    AbiParametersToPrimitiveTypes,
    ExtractAbiFunction,
} from "abitype";
import { type Address, decodeFunctionData, erc20Abi, getAddress } from "viem";

export const destination = (token: Address) => (output: Output) =>
    output.decodedData.type === "Voucher" &&
    getAddress(output.decodedData.destination) === getAddress(token);

export const transferTo = (recipient: Address) => (output: Output) => {
    if (output.decodedData.type !== "Voucher") {
        return false;
    }
    try {
        const { functionName, args } = decodeFunctionData({
            abi: erc20Abi,
            data: output.decodedData.payload,
        });
        if (functionName === "transfer") {
            const [to] = args;
            return getAddress(to) === getAddress(recipient);
        }
        if (functionName === "transferFrom") {
            const [_, to] = args;
            return getAddress(to) === getAddress(recipient);
        }
    } catch (e: unknown) {
        return false;
    }
    return false;
};

export type ExecuteOutputArgs = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iApplicationAbi, "executeOutput">["inputs"]
>;
export const toEVM = (output: Output): ExecuteOutputArgs => {
    const { index: outputIndex, outputHashesSiblings, rawData } = output;
    if (!outputHashesSiblings) {
        throw new Error("Output has no proof");
    }
    return [rawData, { outputIndex, outputHashesSiblings }];
};
