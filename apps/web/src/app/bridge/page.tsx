"use client";
import { erc20PortalAddress } from "@cartesi/viem/abi";
import { Group } from "@mantine/core";
import { createPlayer } from "@onchess/core";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Hash, erc20Abi, getAddress } from "viem";
import {
    useAccount,
    useCallsStatus,
    useConnect,
    useDisconnect,
    useReadContracts,
    useWaitForTransactionReceipt,
} from "wagmi";
import { Bridge } from "../../components/bridge/Bridge";
import { Shell } from "../../components/navigation/Shell";
import { useBridgeActions } from "../../hooks/bridge";
import { useApplicationAddress } from "../../hooks/config";
import { useLatestState } from "../../hooks/state";
import { ExecutableVoucher, useVouchers } from "../../hooks/voucher";
import { extractChain } from "../../providers/wallet";
import { destination, transferTo } from "../../util/voucher";

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

    // paymaster configuration
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

    const application = useApplicationAddress();
    const player = address
        ? state && state.players
            ? (state.players[getAddress(address)] ??
              createPlayer(getAddress(address)))
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

    // smart contracts actions
    const {
        approveAsync,
        approveAndDepositAsync,
        depositAsync,
        executeVoucherAsync,
        isPending,
        requestWithdrawAsync,
    } = useBridgeActions(paymasterUrl);

    // transaction processing
    const [error, setError] = useState<string | undefined>(undefined);
    const [hash, setHash] = useState<Hash | undefined>(undefined);
    const [callId, setCallId] = useState<string>("");
    const { isFetching } = useWaitForTransactionReceipt({ hash });
    const { isFetching: isBatchFetching } = useCallsStatus({
        id: callId,
        query: { enabled: !!callId },
    });

    const handleApprove = async (amount: string) => {
        if (token) {
            setError(undefined);
            try {
                const hash = await approveAsync({
                    address: token.address,
                    args: [erc20PortalAddress, BigInt(amount)],
                });
                setHash(hash);
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    const handleDeposit = async (amount: string) => {
        if (application && token) {
            setError(undefined);
            try {
                const hash = await depositAsync({
                    args: [token.address, application, BigInt(amount), "0x"],
                });
                setHash(hash);
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    const handleApproveAndDeposit = approveAndDepositAsync
        ? async (amount: string) => {
              if (application && token) {
                  setError(undefined);
                  try {
                      const { id } = await approveAndDepositAsync(
                          application,
                          token.address,
                          BigInt(amount),
                      );
                      setCallId(id);
                  } catch (e: any) {
                      setError(e.message);
                  }
              }
          }
        : undefined;

    const handleWithdraw = async (amount: string) => {
        if (application) {
            setError(undefined);
            try {
                const { id } = await requestWithdrawAsync(
                    application,
                    BigInt(amount),
                );
                setCallId(id);
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    const handleExecuteVoucher = async (output: ExecutableVoucher) => {
        if (application && output.executable) {
            setError(undefined);
            try {
                const { id } = await executeVoucherAsync(application, output);
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
                        disabled={!application}
                        error={error}
                        executing={
                            isFetching ||
                            isBatchFetching ||
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
