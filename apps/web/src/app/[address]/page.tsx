"use client";
import { Center, Stack } from "@mantine/core";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { useWalletConnect } from "../../providers/wallet/useWalletConnect";
import { Gameboard } from "../../components/Gameboard";
import { Profile } from "../../components/Profile";
import { Shell } from "../../components/navigation/Shell";
import { useClock } from "../../hooks/clock";
import { useLatestState } from "../../hooks/state";

export default async function AddressPage({
    params,
}: {
    params: Promise<{ address: string }>;
}) {
    const now = useClock();
    const { state } = useLatestState(10000);

    // connection
    const { address: connectedAddress, isConnected } = useAccount();
    const { connect, disconnect, isConnecting } = useWalletConnect();

    const token = state?.config.token;
    const { address } = await params;
    const game = isAddress(address) ? state?.games[address] : undefined;
    const player = isAddress(address) ? state?.players[address] : undefined;

    return (
        <Shell
            address={connectedAddress}
            isConnecting={isConnecting}
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
            player={player}
            token={token}
        >
            {game && (
                <Center>
                    <Gameboard
                        now={now}
                        onClaimVictory={() => {}}
                        onMove={() => {}}
                        onResign={() => {}}
                        submitting={false}
                        game={game}
                    />
                </Center>
            )}
            {player && (
                <Stack p={20}>
                    <Profile player={player} />
                </Stack>
            )}
        </Shell>
    );
}
