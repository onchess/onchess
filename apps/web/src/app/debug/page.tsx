"use client";

import {
    Button,
    Group,
    JsonInput,
    Loader,
    Stack,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import type { FC } from "react";
import { useAccount, useCapabilities, useDisconnect } from "wagmi";
import { Shell } from "../../components/navigation/Shell";
import {
    useAtomicSupport,
    usePaymasterServiceSupport,
    usePermissionsSupport,
} from "../../hooks/capabilities";
import { useClock } from "../../hooks/clock";
import { useSessionId } from "../../hooks/session";
import { useLatestState } from "../../hooks/state";
import { usePasskeyConnect } from "../../providers/wallet/zerodev/usePasskeyConnect";

export default () => {
    const { data: capabilities } = useCapabilities();
    const now = useClock();
    const { inputIndex, loading, state } = useLatestState(2000);
    const token = state?.config.token;

    // wallet actions
    const { address, isConnected } = useAccount();
    const { login, register, isPending: isConnecting } = usePasskeyConnect();
    const { disconnect } = useDisconnect();

    // wallet capabilities
    const { expiry, requestPermissionsAsync, sessionId } = useSessionId();
    const { supported: atomicBatchSupported, error: atomicError } =
        useAtomicSupport();
    const { supported: permissionsSupported, error: permissionsError } =
        usePermissionsSupport();
    const { supported: paymasterServiceSupported, error: paymasterError } =
        usePaymasterServiceSupport();

    const TrueFalseIcon: FC<{ value: boolean | undefined }> = ({ value }) =>
        value === undefined ? (
            <Loader size="xs" />
        ) : value ? (
            <IconCircleCheck color="green" />
        ) : (
            <IconCircleX color="red" />
        );

    return (
        <Shell
            isConnected={isConnected}
            isConnecting={isConnecting}
            onConnect={() => {}}
            onLogin={() => login?.({ passkeyName: "OnChess" })}
            onRegister={() => register?.({ passkeyName: "OnChess" })}
            onDisconnect={disconnect}
            address={address}
            token={token}
        >
            <Stack gap="md">
                <Title>Wallet</Title>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Capability</Table.Th>
                            <Table.Th>Support</Table.Th>
                            <Table.Th>Error</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td>Atomic Batch</Table.Td>
                            <Table.Td>
                                <TrueFalseIcon value={atomicBatchSupported} />
                            </Table.Td>
                            <Table.Td>
                                <Text>{atomicError?.message}</Text>
                            </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td>Paymaster Service</Table.Td>
                            <Table.Td>
                                <TrueFalseIcon
                                    value={paymasterServiceSupported}
                                />
                            </Table.Td>
                            <Table.Td>
                                <Text>{paymasterError?.message}</Text>
                            </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td>Permissions</Table.Td>
                            <Table.Td>
                                <TrueFalseIcon value={permissionsSupported} />
                            </Table.Td>
                            <Table.Td>
                                <Text>{permissionsError?.message}</Text>
                            </Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
                <JsonInput
                    value={JSON.stringify(capabilities, null, 2)}
                    readOnly
                    rows={20}
                />
                <Group>
                    <Text>Session</Text>
                    <TextInput readOnly value={sessionId ?? "N/A"} />
                    <Button onClick={() => requestPermissionsAsync(now + 3600)}>
                        Request Permissions
                    </Button>
                </Group>
                <Title>
                    <Group>
                        <Text>State</Text>
                        {inputIndex && <Text>({inputIndex})</Text>}
                        {loading && <Loader />}
                    </Group>
                </Title>
                <JsonInput
                    value={JSON.stringify(state, null, 2)}
                    readOnly
                    rows={20}
                />
            </Stack>
        </Shell>
    );
};
