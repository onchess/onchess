"use client";
import { Center, Stack } from "@mantine/core";
import { isAddress } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Gameboard } from "../../components/Gameboard";
import { Profile } from "../../components/Profile";
import { Shell } from "../../components/navigation/Shell";
import { useClock } from "../../hooks/clock";
import { useLatestState } from "../../hooks/state";

export default function AddressPage({
    params,
}: {
    params: { address: string };
}) {
    const now = useClock();
    const { state } = useLatestState(10000);

    // connection
    const { address: connectedAddress, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const handleConnect = () => connect({ connector: connectors[0] });
    const { disconnect } = useDisconnect();

    const token = state?.config.token;
    const { address } = params;
    const game = isAddress(address) ? state?.games[address] : undefined;
    const player = isAddress(address) ? state?.players[address] : undefined;

    return (
        <Shell
            address={connectedAddress}
            isConnecting={isConnecting}
            isConnected={isConnected}
            onConnect={handleConnect}
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
