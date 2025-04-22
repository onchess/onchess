import { Output } from "@cartesi/viem";
import {
    erc20PortalAbi,
    erc20PortalAddress,
    iApplicationAbi,
    inputBoxAbi,
    inputBoxAddress,
} from "@cartesi/viem/abi";
import {
    AbiParametersToPrimitiveTypes,
    Address,
    ExtractAbiFunction,
} from "abitype";
import { toEVM } from "../util/voucher";

type AddInputCallParameters = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof inputBoxAbi, "addInput">["inputs"]
>;
export const createAddInputCall = (args: AddInputCallParameters) => ({
    address: inputBoxAddress,
    abi: inputBoxAbi,
    functionName: "addInput",
    args,
});

type DepositERC20TokensCallParameters = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof erc20PortalAbi, "depositERC20Tokens">["inputs"]
>;
export const createDepositERC20TokensCall = (
    args: DepositERC20TokensCallParameters,
) => ({
    address: erc20PortalAddress,
    abi: erc20PortalAbi,
    functionName: "depositERC20Tokens",
    args,
});

type ExecuteOutputCallParameters = {
    application: Address;
    output: Output;
};

export const createExecuteOutputCall = (args: ExecuteOutputCallParameters) => ({
    address: args.application,
    abi: iApplicationAbi,
    functionName: "executeOutput",
    args: toEVM(args.output),
});
