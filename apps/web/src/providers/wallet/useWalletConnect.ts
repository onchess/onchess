import { jaw, useConnect, useDisconnect } from "@jaw.id/wagmi";
import { useConnectors } from "wagmi";

/**
 * Unified wallet connect/disconnect for the JAW connector. JAW uses a single
 * passkey connect flow (no separate register/login), so this exposes one
 * `connect` action. The JAW-specific hooks are used (rather than wagmi's) so the
 * passkey dialog and session cleanup are handled by the connector.
 */
export function useWalletConnect() {
    const connectors = useConnectors();
    const connector = connectors.find((c) => c.type === jaw.type);
    const { mutate: connectMutate, isPending: isConnecting } = useConnect();
    const { mutate: disconnectMutate } = useDisconnect();

    const connect = () => {
        if (connector) {
            connectMutate({ connector });
        }
    };

    const disconnect = () => disconnectMutate({});

    return { connect, disconnect, isConnecting };
}
