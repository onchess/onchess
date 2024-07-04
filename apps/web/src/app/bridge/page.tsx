"use client";
import { Group } from "@mantine/core";
import { ABI, createPlayer } from "@onchess/core";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
    Hash,
    WalletCapabilities,
    encodeFunctionData,
    erc20Abi,
    getAddress,
} from "viem";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useReadContracts,
    useWaitForTransactionReceipt,
} from "wagmi";
import { useCallsStatus, useWriteContracts } from "wagmi/experimental";
import { Bridge } from "../../components/bridge/Bridge";
import { Shell } from "../../components/navigation/Shell";
import {
    useAtomicBatchSupport,
    usePaymasterServiceSupport,
} from "../../hooks/capabilities";
import { useApplicationAddress } from "../../hooks/config";
import {
    cartesiDAppAbi,
    erc20PortalAbi,
    erc20PortalAddress,
    inputBoxAbi,
    inputBoxAddress,
    useWriteCartesiDAppExecuteVoucher,
    useWriteErc20Approve,
    useWriteErc20PortalDepositErc20Tokens,
    useWriteInputBoxAddInput,
} from "../../hooks/contracts";
import { useLatestState } from "../../hooks/state";
import { ExecutableVoucher, useVouchers } from "../../hooks/voucher";
import { extractChain } from "../../providers/wallet";
import { destination, toEVM, transferTo } from "../../util/voucher";

const BridgePage = () => {
    const searchParams = useSearchParams();
    const depositAmount = searchParams?.get("deposit");
    const withdrawAmount = searchParams?.get("withdraw");

    // read chain from environment variable configuration
    const chain = extractChain();

    const { loading, state } = useLatestState(20000);

    const token = state?.config.token;

    // connection
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const handleConnect = () => connect({ connector: connectors[0] });

    const dapp = useApplicationAddress();
    const player = address
        ? state && state.players
            ? state.players[getAddress(address)] ??
              createPlayer(getAddress(address))
            : createPlayer(getAddress(address))
        : undefined;

    // all vouchers in the state
    const { data: vouchers } = useVouchers();

    // filter only vouchers that are ERC-20 transfers to the player
    const playerVouchers =
        token && player
            ? vouchers
                  .filter(destination(token.address))
                  .filter(transferTo(player.address))
            : [];

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

    const hasData = token !== undefined;

    // paymaster support
    const { supported: paymasterSupported } = usePaymasterServiceSupport();
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
                              const id = await writeContractsAsync({
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
    const { writeContractAsync: approve, isPending: approvePending } =
        useWriteErc20Approve();
    const { writeContractAsync: deposit, isPending: depositPending } =
        useWriteErc20PortalDepositErc20Tokens();
    const { writeContractAsync: addInput, isPending: addInputPending } =
        useWriteInputBoxAddInput();
    const { writeContractsAsync, isPending } = useWriteContracts();
    const {
        writeContractAsync: executeVoucher,
        isPending: executeVoucherPending,
    } = useWriteCartesiDAppExecuteVoucher();

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

    const handleExecuteVoucher = async (voucher: ExecutableVoucher) => {
        if (dapp && voucher.proof) {
            setError(undefined);
            try {
                const capabilities: WalletCapabilities = {};
                if (paymasterSupported && paymasterUrl) {
                    capabilities.paymasterService = { url: paymasterUrl };
                }
                const id = await writeContractsAsync({
                    contracts: [
                        {
                            abi: cartesiDAppAbi,
                            functionName: "executeVoucher",
                            address: dapp,
                            args: toEVM(voucher),
                        },
                    ],
                    capabilities,
                });
                setCallId(id);
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
                const capabilities: WalletCapabilities = {};
                if (paymasterSupported && paymasterUrl) {
                    capabilities.paymasterService = { url: paymasterUrl };
                }
                const id = await writeContractsAsync({
                    contracts: [
                        {
                            address: inputBoxAddress,
                            abi: inputBoxAbi,
                            functionName: "addInput",
                            args: [dapp, payload],
                        },
                    ],
                    capabilities,
                });
                setCallId(id);
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    return (
        <Shell
            address={address}
            isConnecting={isConnecting}
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={disconnect}
            player={player}
            token={token}
        >
            <Group p={20} justify="center">
                {hasData && (
                    <Bridge
                        applicationBalance={player?.balance}
                        allowance={allowance?.toString()}
                        chain={chain}
                        connecting={isConnecting}
                        balance={balance?.toString()}
                        disabled={!dapp}
                        error={error}
                        executing={
                            isFetching ||
                            isBatchFetching ||
                            approvePending ||
                            depositPending ||
                            addInputPending ||
                            isPending ||
                            loading
                        }
                        initialDepositAmount={depositAmount}
                        initialWithdrawAmount={withdrawAmount}
                        onApprove={handleApprove}
                        onApproveAndDeposit={handleApproveAndDeposit}
                        onConnect={handleConnect}
                        onDeposit={handleDeposit}
                        onExecuteVoucher={handleExecuteVoucher}
                        onWithdraw={handleWithdraw}
                        token={token}
                        vouchers={playerVouchers}
                    />
                )}
            </Group>
        </Shell>
    );
};

export default () => {
    return (
        <Suspense>
            <BridgePage />
        </Suspense>
    );
};
