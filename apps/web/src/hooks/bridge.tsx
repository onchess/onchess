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
import {
    createAddInputCall,
    createDepositERC20TokensCall,
    createExecuteOutputCall,
} from "../calls";
import { useAtomicSupport, usePaymasterServiceSupport } from "./capabilities";
import { useWriteErc20Approve } from "./contracts";
import { useSendCartesiCalls } from "./utils";

export const useBridgeActions = (
    application?: Address,
    paymasterUrl?: string,
) => {
    const { calls, callsStatus, inputs } = useSendCartesiCalls();
    const { sendCalls } = calls;
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
    const { supported: atomicSupported } = useAtomicSupport();

    const { writeContract: approve } = useWriteErc20Approve();
    const { writeContract: deposit } = useWriteErc20PortalDepositErc20Tokens();

    const capabilities: WalletCapabilities = {};
    if (paymasterSupported && paymasterUrl) {
        capabilities.paymasterService = { url: paymasterUrl };
    }

    if (!application) {
        return {
            calls,
            callsStatus,
            inputs,
            approve,
            approveAndDeposit: undefined,
            deposit,
            executeVoucher: undefined,
            requestWithdraw: undefined,
        };
    }

    const executeVoucher = async (output: Output) => {
        sendCalls({
            calls: [createExecuteOutputCall({ application, output })],
            capabilities,
        });
    };

    const requestWithdraw = async (amount: bigint) => {
        const payload = encodeFunctionData({
            abi: ABI,
            functionName: "withdraw",
            args: [amount],
        });
        sendCalls({
            calls: [createAddInputCall([application, payload])],
            capabilities,
        });
    };

    const approveAndDeposit = atomicSupported
        ? async (token: Address, amount: bigint) => {
              sendCalls({
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
        calls,
        callsStatus,
        inputs,
        approve,
        approveAndDeposit,
        deposit,
        executeVoucher,
        requestWithdraw,
    };
};
