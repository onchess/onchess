import type { Output } from "@cartesi/viem";
import {
    erc20PortalAbi,
    erc20PortalAddress,
    iApplicationAbi,
    inputBoxAbi,
    inputBoxAddress,
} from "@cartesi/viem/abi";
import type {
    AbiParametersToPrimitiveTypes,
    Address,
    ExtractAbiFunction,
} from "abitype";
import { encodeFunctionData } from "viem";
import { toEVM } from "../util/voucher";

type AddInputCallParameters = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof inputBoxAbi, "addInput">["inputs"]
>;
export const createAddInputCall = (args: AddInputCallParameters) => ({
    to: inputBoxAddress,
    data: encodeFunctionData({
        abi: inputBoxAbi,
        functionName: "addInput",
        args,
    }),
});

type DepositERC20TokensCallParameters = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof erc20PortalAbi, "depositERC20Tokens">["inputs"]
>;
export const createDepositERC20TokensCall = (
    args: DepositERC20TokensCallParameters,
) => ({
    to: erc20PortalAddress,
    data: encodeFunctionData({
        abi: erc20PortalAbi,
        functionName: "depositERC20Tokens",
        args,
    }),
});

type ExecuteOutputCallParameters = {
    application: Address;
    output: Output;
};

export const createExecuteOutputCall = (args: ExecuteOutputCallParameters) => ({
    to: args.application,
    data: encodeFunctionData({
        abi: iApplicationAbi,
        functionName: "executeOutput",
        args: toEVM(args.output),
    }),
});
