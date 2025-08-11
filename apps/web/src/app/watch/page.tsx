"use client";
import { createPlayer } from "@onchess/core";
import { getAddress } from "viem";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Games } from "../../components/Games";
import { Shell } from "../../components/navigation/Shell";
import { useClock } from "../../hooks/clock";
import { useLatestState } from "../../hooks/state";

export default function WatchPage() {
    const now = useClock();
    const { state } = useLatestState(2000);
    const token = state?.config.token;

    // connection
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const handleConnect = () => connect({ connector: connectors[0] });

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
            onConnect={handleConnect}
            onDisconnect={disconnect}
            player={player}
            token={token}
        >
            {token && (
                <Games
                    account={player?.address}
                    games={state?.games ?? {}}
                    now={now}
                    token={token}
                />
            )}
        </Shell>
    );
}
