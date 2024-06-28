"use client";
import { Box, Stack } from "@mantine/core";
import { createPlayer } from "@onchess/core";
import { getAddress } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Header } from "../../components/Header";
import { Profile } from "../../components/Profile";
import { useLatestState } from "../../hooks/state";

export default function ProfilePage() {
    const { state } = useLatestState(20000);
    const token = state?.config.token;

    // connection
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const handleConnect = () => connect({ connector: connectors[0] });

    const player = address
        ? state && state.players
            ? state.players[getAddress(address)] ??
              createPlayer(getAddress(address))
            : createPlayer(getAddress(address))
        : undefined;

    return (
        <Stack>
            <Header
                address={address}
                isConnecting={isConnecting}
                isConnected={isConnected}
                onConnect={handleConnect}
                onDisconnect={disconnect}
                player={player}
                token={token}
            />
            <Box p={20}>{player && <Profile player={player} />}</Box>
        </Stack>
    );
}
