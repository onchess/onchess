"use client";
import { Box } from "@mantine/core";
import { createPlayer } from "@onchess/core";
import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { useWalletConnect } from "../../providers/wallet/useWalletConnect";
import { Profile } from "../../components/Profile";
import { Shell } from "../../components/navigation/Shell";
import { useLatestState } from "../../hooks/state";

export default function ProfilePage() {
    const { state } = useLatestState(20000);
    const token = state?.config.token;

    // connection
    const { address, isConnected } = useAccount();
    const { connect, disconnect, isConnecting } = useWalletConnect();

    const player = address
        ? state?.players
            ? (state.players[getAddress(address)] ??
              createPlayer(getAddress(address)))
            : createPlayer(getAddress(address))
        : undefined;

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
            <Box p={20}>{player && <Profile player={player} />}</Box>
        </Shell>
    );
}
