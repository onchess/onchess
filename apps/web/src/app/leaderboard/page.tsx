"use client";
import { createPlayer } from "@onchess/core";
import { getAddress } from "viem";
import { useAccount } from "wagmi";
import { useWalletConnect } from "../../providers/wallet/useWalletConnect";
import { Leaderboard } from "../../components/Leaderboard";
import { Shell } from "../../components/navigation/Shell";
import { useLatestState } from "../../hooks/state";

export default function LeaderboardPage() {
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
            <Leaderboard players={state?.players ?? {}} />
        </Shell>
    );
}
