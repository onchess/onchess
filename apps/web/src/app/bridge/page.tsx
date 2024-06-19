"use client";
import { Box, Stack } from "@mantine/core";
import { ABI, createPlayer } from "@onchess/core";
import { useState } from "react";
import { Hash, encodeFunctionData, erc20Abi, getAddress } from "viem";
import {
    useAccount,
    useReadContracts,
    useWaitForTransactionReceipt,
} from "wagmi";
import { Bridge } from "../../components/Bridge";
import { Header } from "../../components/Header";
import { useApplicationAddress } from "../../hooks/config";
import {
    erc20PortalAddress,
    useWriteErc20Approve,
    useWriteErc20PortalDepositErc20Tokens,
    useWriteInputBoxAddInput,
} from "../../hooks/contracts";
import { useLatestState } from "../../hooks/state";

export default function ProfilePage() {
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

    // smart contracts actions
    const { writeContractAsync: approve } = useWriteErc20Approve();
    const { writeContractAsync: deposit } =
        useWriteErc20PortalDepositErc20Tokens();
    const { writeContractAsync: addInput } = useWriteInputBoxAddInput();

    // transaction processing
    const [hash, setHash] = useState<Hash | undefined>(undefined);
    const { isFetching } = useWaitForTransactionReceipt({ hash });

    return (
        <Stack>
            <Header player={player} token={token} />
            <Box p={20}>
                {hasData && (
                    <Bridge
                        applicationBalance={player.balance}
                        allowance={allowance.toString()}
                        chain={chain}
                        balance={balance.toString()}
                        disabled={!dapp}
                        executing={isFetching}
                        token={token}
                        onApprove={(amount) =>
                            approve({
                                address: token.address,
                                args: [erc20PortalAddress, BigInt(amount)],
                            }).then(setHash)
                        }
                        onDeposit={(amount) => {
                            if (dapp) {
                                deposit({
                                    args: [
                                        token.address,
                                        dapp,
                                        BigInt(amount),
                                        "0x",
                                    ],
                                }).then(setHash);
                            }
                        }}
                        onWithdraw={(amount) => {
                            if (dapp) {
                                const payload = encodeFunctionData({
                                    abi: ABI,
                                    functionName: "withdraw",
                                    args: [BigInt(amount)],
                                });
                                addInput({ args: [dapp, payload] }).then(
                                    setHash,
                                );
                            }
                        }}
                    />
                )}
            </Box>
        </Stack>
    );
}
