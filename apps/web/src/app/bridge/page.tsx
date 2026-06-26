"use client";
import { erc20PortalAddress } from "@cartesi/viem/abi";
import { Group } from "@mantine/core";
import { createPlayer } from "@onchess/core";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { Address } from "viem";
import { erc20Abi, getAddress } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { Bridge } from "../../components/bridge/Bridge";
import { Shell } from "../../components/navigation/Shell";
import { InputStatus } from "../../containers/InputStatus";
import { useBridgeActions } from "../../hooks/bridge";
import { useApplicationAddress } from "../../hooks/config";
import { useLatestState } from "../../hooks/state";
import { type ExecutableVoucher, useVouchers } from "../../hooks/voucher";
import { extractChain } from "../../providers/wallet";
import { useWalletConnect } from "../../providers/wallet/useWalletConnect";
import { destination, transferTo } from "../../util/voucher";

const BridgePage = () => {
    const searchParams = useSearchParams();
    const depositAmount = searchParams?.get("deposit");
    const withdrawAmount = searchParams?.get("withdraw");

    // read chain from environment variable configuration
    const chain = extractChain();

    const { loading, state } = useLatestState(2000);

    const token = state?.config.token;

    // connection
    const { address, isConnected } = useAccount();
    const { connect, disconnect, isConnecting } = useWalletConnect();

    // paymaster configuration
    const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL;

    const application = useApplicationAddress();
    const player = address
        ? state?.players
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
                address: token?.address,
                functionName: "allowance",
                args: [address as Address, erc20PortalAddress],
            },
            {
                abi: erc20Abi,
                address: token?.address,
                functionName: "balanceOf",
                args: [address as Address],
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

    // transaction mining
    const [message, setMessage] = useState<string | undefined>();

    // smart contracts actions
    const {
        callsStatus,
        inputs,
        approve,
        approveAndDeposit,
        deposit,
        executeVoucher,
        requestWithdraw,
    } = useBridgeActions(application, paymasterUrl);

    const handleApprove = async (amount: string) => {
        if (token) {
            setMessage("Approving ERC-20 spending...");
            approve({
                address: token.address,
                args: [erc20PortalAddress, BigInt(amount)],
            });
        }
    };

    const handleDeposit = async (amount: string) => {
        if (application && token) {
            setMessage("Depositing ERC-20...");
            deposit({
                args: [token.address, application, BigInt(amount), "0x"],
            });
        }
    };

    const handleApproveAndDeposit = approveAndDeposit
        ? async (amount: string) => {
              if (application && token) {
                  setMessage("Depositing ERC-20...");
                  approveAndDeposit(token.address, BigInt(amount));
              }
          }
        : undefined;

    const handleWithdraw = async (amount: string) => {
        if (requestWithdraw) {
            setMessage("Requesting ERC-20 withdraw...");
            requestWithdraw(BigInt(amount));
        }
    };

    const handleExecuteVoucher = async (output: ExecutableVoucher) => {
        if (executeVoucher && output.executable) {
            setMessage("Finalizing ERC-20 withdraw...");
            executeVoucher(output);
        }
    };

    return (
        <Shell
            address={address}
            isConnecting={isConnecting}
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
            player={player}
            token={token}
        >
            {inputs?.map((input) => (
                <InputStatus
                    key={input.index}
                    application={input.appContract}
                    inputIndex={input.index}
                    message={message}
                />
            ))}
            <Group p={20} justify="center">
                {hasData && (
                    <Bridge
                        applicationBalance={player?.balance}
                        allowance={allowance?.toString()}
                        chain={chain}
                        connecting={isConnecting}
                        balance={balance?.toString()}
                        disabled={!application}
                        error={callsStatus.error?.message}
                        executing={callsStatus.isLoading || loading}
                        initialDepositAmount={depositAmount}
                        initialWithdrawAmount={withdrawAmount}
                        onApprove={handleApprove}
                        onApproveAndDeposit={handleApproveAndDeposit}
                        onConnect={connect}
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
