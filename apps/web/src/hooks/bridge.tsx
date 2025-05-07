import { Output } from "@cartesi/viem";
import {
    erc20PortalAddress,
    useWriteErc20PortalDepositErc20Tokens,
} from "@cartesi/wagmi";
import { ABI } from "@onchess/core";
import {
    Address,
    encodeFunctionData,
    erc20Abi,
    WalletCapabilities,
} from "viem";
import { useChainId, useSendCalls } from "wagmi";
import {
    createAddInputCall,
    createDepositERC20TokensCall,
    createExecuteOutputCall,
} from "../calls";
import {
    useAtomicBatchSupport,
    usePaymasterServiceSupport,
} from "./capabilities";
import { useWriteErc20Approve } from "./contracts";

export const useBridgeActions = (paymasterUrl?: string) => {
    const { sendCallsAsync, isPending } = useSendCalls();
    const chainId = useChainId();
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const { supported: atomicSupported } = useAtomicBatchSupport();

    const { writeContractAsync: approveAsync, isPending: approvePending } =
        useWriteErc20Approve();
    const { writeContractAsync: depositAsync, isPending: depositPending } =
        useWriteErc20PortalDepositErc20Tokens();

    const capabilities: WalletCapabilities = {};
    if (paymasterSupported && paymasterUrl) {
        capabilities.paymasterService = { url: paymasterUrl };
    }

    const executeVoucherAsync = async (
        application: Address,
        output: Output,
    ) => {
        const result = await sendCallsAsync({
            calls: [createExecuteOutputCall({ application, output })],
            capabilities,
        });
        return result;
    };

    const requestWithdrawAsync = async (
        application: Address,
        amount: bigint,
    ) => {
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
        ? async (application: Address, token: Address, amount: bigint) => {
              return sendCallsAsync({
                  calls: [
                      {
                          abi: erc20Abi,
                          address: token,
                          functionName: "approve",
                          args: [erc20PortalAddress, amount],
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
                          ? {
                                [chainId]: {
                                    url: paymasterUrl,
                                },
                            }
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
