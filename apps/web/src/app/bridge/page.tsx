"use client";
import { Group, Stack } from "@mantine/core";
import { ABI, createPlayer } from "@onchess/core";
import { useEffect, useState } from "react";
import { Hash, encodeFunctionData, erc20Abi, getAddress } from "viem";
import {
    useAccount,
    useReadContracts,
    useWaitForTransactionReceipt,
} from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { Bridge } from "../../components/Bridge";
import { Header } from "../../components/Header";
import { useAtomicBatchSupport } from "../../hooks/capabilities";
import { useApplicationAddress } from "../../hooks/config";
import {
    erc20PortalAbi,
    erc20PortalAddress,
    useWriteErc20Approve,
    useWriteErc20PortalDepositErc20Tokens,
    useWriteInputBoxAddInput,
} from "../../hooks/contracts";
import { useLatestState } from "../../hooks/state";

export default function BridgePage() {
    const { state } = useLatestState(20000);

    const token = state?.config.token;
    const { address, chain } = useAccount();
    const dapp = useApplicationAddress();
    const player = address
        ? state && state.players
            ? state.players[getAddress(address)] ??
              createPlayer(getAddress(address))
            : createPlayer(getAddress(address))
        : undefined;

    const { data } = useReadContracts({
        contracts: [
            {
                abi: erc20Abi,
                address: token!.address,
                functionName: "allowance",
                args: [address!, erc20PortalAddress],
            },
            {
                abi: erc20Abi,
                address: token!.address,
                functionName: "balanceOf",
                args: [address!],
            },
        ],
        query: {
            enabled: !!address && !!token,
            refetchInterval: 2000,
        },
    });

    const { result: allowance } = data?.[0] || {};
    const { result: balance } = data?.[1] || {};

    const hasData =
        chain &&
        player &&
        allowance !== undefined &&
        balance !== undefined &&
        token !== undefined;

    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

    // batch transactions capability
    const { supported } = useAtomicBatchSupport();
    const [handleApproveAndDeposit, setHandleApproveAndDeposit] = useState<
        ((amount: string) => Promise<void>) | undefined
    >(undefined);
    useEffect(() => {
        setHandleApproveAndDeposit(
            supported
                ? () => async (amount: string) => {
                      if (dapp && token) {
                          setError(undefined);
                          try {
                              const id = await approveAndDeposit({
                                  contracts: [
                                      {
                                          abi: erc20Abi,
                                          address: token.address,
                                          functionName: "approve",
                                          args: [
                                              erc20PortalAddress,
                                              BigInt(amount),
                                          ],
                                      },
                                      {
                                          abi: erc20PortalAbi,
                                          address: erc20PortalAddress,
                                          functionName: "depositERC20Tokens",
                                          args: [
                                              token.address,
                                              dapp,
                                              BigInt(amount),
                                              "0x",
                                          ],
                                      },
                                  ],
                                  capabilities: {
                                      paymasterService: {
                                          url: paymasterUrl,
                                      },
                                  },
                              });
                              setCallId(id);
                          } catch (e: any) {
                              setError(e.message);
                          }
                      }
                  }
                : undefined,
        );
    }, [supported]);

    // smart contracts actions
    const { writeContractAsync: approve } = useWriteErc20Approve();
    const { writeContractAsync: deposit } =
        useWriteErc20PortalDepositErc20Tokens();
    const { writeContractAsync: addInput } = useWriteInputBoxAddInput();
    const { writeContractsAsync: approveAndDeposit } = useWriteContracts();

    // transaction processing
    const [error, setError] = useState<string | undefined>(undefined);
    const [hash, setHash] = useState<Hash | undefined>(undefined);
    const [callId, setCallId] = useState<string>("");
    const { isFetching } = useWaitForTransactionReceipt({ hash });
    const { isFetching: isBatchFetching } = useCallsStatus({
        id: callId,
        query: { enabled: !!callId },
    });

    const handleDeposit = async (amount: string) => {
        if (dapp && token) {
            setError(undefined);
            try {
                const hash = await deposit({
                    args: [token.address, dapp, BigInt(amount), "0x"],
                });
                setHash(hash);
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    const handleApprove = async (amount: string) => {
        if (token) {
            setError(undefined);
            try {
                const hash = await approve({
                    address: token.address,
                    args: [erc20PortalAddress, BigInt(amount)],
                });
                setHash(hash);
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    const handleWithdraw = async (amount: string) => {
        if (dapp) {
            setError(undefined);
            try {
                const payload = encodeFunctionData({
                    abi: ABI,
                    functionName: "withdraw",
                    args: [BigInt(amount)],
                });
                const hash = await addInput({ args: [dapp, payload] });
                setHash(hash);
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    return (
        <Stack>
            <Header player={player} token={token} />
            <Group p={20} justify="center">
                {hasData && (
                    <Bridge
                        applicationBalance={player.balance}
                        allowance={allowance.toString()}
                        chain={chain}
                        balance={balance.toString()}
                        disabled={!dapp}
                        error={error}
                        executing={isFetching || isBatchFetching}
                        token={token}
                        onApprove={handleApprove}
                        onApproveAndDeposit={handleApproveAndDeposit}
                        onDeposit={handleDeposit}
                        onWithdraw={handleWithdraw}
                    />
                )}
            </Group>
        </Stack>
    );
}
