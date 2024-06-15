"use client";
import { Box, Stack } from "@mantine/core";
import { createPlayer } from "@onchess/core";
import { useState } from "react";
import { Hash, erc20Abi, getAddress } from "viem";
import {
    useAccount,
    useReadContracts,
    useWaitForTransactionReceipt,
} from "wagmi";
import { Header } from "../../components/Header";
import { Profile } from "../../components/Profile";
import {
    erc20PortalAddress,
    useWriteErc20Approve,
    useWriteErc20PortalDepositErc20Tokens,
} from "../../hooks/contracts";
import { useLatestState } from "../../hooks/state";
import { dapp, token } from "../../providers/config";

export default function ProfilePage() {
    const { state } = useLatestState(20000);
    const { address } = useAccount();
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
                address: token.address,
                functionName: "allowance",
                args: [address!, erc20PortalAddress],
            },
            {
                abi: erc20Abi,
                address: token.address,
                functionName: "balanceOf",
                args: [address!],
            },
        ],
        query: {
            enabled: !!address,
            refetchInterval: 2000,
        },
    });

    const { result: allowance } = data?.[0] || {};
    const { result: balance } = data?.[1] || {};

    const hasData = player && allowance !== undefined && balance !== undefined;

    // smart contracts actions
    const { writeContractAsync: approve } = useWriteErc20Approve();
    const { writeContractAsync: deposit } =
        useWriteErc20PortalDepositErc20Tokens();

    // transaction processing
    const [hash, setHash] = useState<Hash | undefined>(undefined);
    const { isFetching } = useWaitForTransactionReceipt({ hash });

    return (
        <Stack>
            <Header player={player} token={token} />
            <Box p={20}>
                {hasData && (
                    <Profile
                        player={player}
                        allowance={allowance.toString()}
                        balance={balance.toString()}
                        executing={isFetching}
                        token={token}
                        onApprove={(amount) =>
                            approve({
                                address: token.address,
                                args: [erc20PortalAddress, BigInt(amount)],
                            }).then(setHash)
                        }
                        onDeposit={(amount) =>
                            deposit({
                                args: [
                                    token.address,
                                    dapp,
                                    BigInt(amount),
                                    "0x",
                                ],
                            }).then(setHash)
                        }
                        onWithdraw={() => {}}
                    />
                )}
            </Box>
        </Stack>
    );
}
