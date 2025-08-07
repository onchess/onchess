import type { Output } from "@cartesi/viem";
import {
    erc20PortalAddress,
    useWriteErc20PortalDepositErc20Tokens,
} from "@cartesi/wagmi";
import { ABI } from "@onchess/core";
import {
    type Address,
    type WalletCapabilities,
    encodeFunctionData,
    erc20Abi,
} from "viem";
import { useSendCalls } from "wagmi";
import {
    createAddInputCall,
    createDepositERC20TokensCall,
    createExecuteOutputCall,
} from "../calls";
import { useAtomicSupport, usePaymasterServiceSupport } from "./capabilities";
import { useWriteErc20Approve } from "./contracts";

export const useBridgeActions = (
    application?: Address,
    paymasterUrl?: string,
) => {
    const { sendCallsAsync, isPending } = useSendCalls();
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const { supported: atomicSupported } = useAtomicSupport();

    const { writeContractAsync: approveAsync, isPending: approvePending } =
        useWriteErc20Approve();
    const { writeContractAsync: depositAsync, isPending: depositPending } =
        useWriteErc20PortalDepositErc20Tokens();

    const capabilities: WalletCapabilities = {};
    if (paymasterSupported && paymasterUrl) {
        capabilities.paymasterService = { url: paymasterUrl };
    }

    if (!application) {
        return {
            approveAsync,
            approveAndDepositAsync: undefined,
            depositAsync,
            executeVoucherAsync: undefined,
            isPending: isPending || approvePending || depositPending,
            requestWithdrawAsync: undefined,
        };
    }

    const executeVoucherAsync = async (output: Output) => {
        const result = await sendCallsAsync({
            calls: [createExecuteOutputCall({ application, output })],
            capabilities,
        });
        return result;
    };

    const requestWithdrawAsync = async (amount: bigint) => {
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "withdraw",
            args: [amount],
        });
        return sendCallsAsync({
            calls: [createAddInputCall([application, payload])],
            capabilities,
        });
    };

    const approveAndDepositAsync = atomicSupported
        ? async (token: Address, amount: bigint) => {
              return sendCallsAsync({
                  calls: [
                      {
                          to: token,
                          data: encodeFunctionData({
                              abi: erc20Abi,
                              functionName: "approve",
                              args: [erc20PortalAddress, amount],
                          }),
                      },
                      createDepositERC20TokensCall([
                          token,
                          application,
                          amount,
                          "0x",
                      ]),
                  ],
                  capabilities: {
                      paymasterService: paymasterUrl
                          ? { url: paymasterUrl }
                          : undefined,
                  },
              });
          }
        : undefined;

    return {
        approveAsync,
        approveAndDepositAsync,
        depositAsync,
        executeVoucherAsync,
        isPending: isPending || approvePending || depositPending,
        requestWithdrawAsync,
    };
};
