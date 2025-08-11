import { useConnect } from "wagmi";
import { type PasskeyConnector, passkeyConnector } from "./passkeyConnector";

export function usePasskeyConnect() {
    const connect = useConnect();

    // find the first configured passkey connector (if any)
    const connector = connect.connectors.find(
        (c) => c.type === passkeyConnector.type,
    ) as PasskeyConnector | undefined;

    const register = connector
        ? (params?: { passkeyName?: string }) => {
              connector.register(params);
              connect.connect({ connector: connector });
          }
        : undefined;
    const login = connector
        ? (params?: { passkeyName?: string }) => {
              connector.login(params);
              connect.connect({ connector: connector });
          }
        : undefined;

    return {
        ...connect,
        login,
        register,
    };
}
