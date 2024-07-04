"use client";

import {
    Button,
    Group,
    JsonInput,
    Loader,
    Table,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { FC } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Shell } from "../../components/navigation/Shell";
import {
    useAtomicBatchSupport,
    usePaymasterServiceSupport,
    usePermissionsSupport,
} from "../../hooks/capabilities";
import { useClock } from "../../hooks/clock";
import { useSessionId } from "../../hooks/session";
import { useLatestState } from "../../hooks/state";

export default () => {
    const now = useClock();
    const { inputIndex, loading, state } = useLatestState(2000);

    // wallet actions
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();

    // wallet capabilities
    const { expiry, requestPermissionsAsync, sessionId } = useSessionId();
    const { supported: atomicBatchSupported } = useAtomicBatchSupport();
    const { supported: permissionsSupported } = usePermissionsSupport();
    const { supported: paymasterServiceSupported } =
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
            onConnect={() => connect({ connector: connectors[0] })}
            onDisconnect={disconnect}
            address={address}
        >
            <Title>Wallet</Title>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Capability</Table.Th>
                        <Table.Th>Support</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td>Atomic Batch</Table.Td>
                        <Table.Td>
                            <TrueFalseIcon value={atomicBatchSupported} />
                        </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Paymaster Service</Table.Td>
                        <Table.Td>
                            <TrueFalseIcon value={paymasterServiceSupported} />
                        </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Permissions</Table.Td>
                        <Table.Td>
                            <TrueFalseIcon value={permissionsSupported} />
                        </Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
            <Group>
                <Text>Session</Text>
                <TextInput readOnly value={sessionId} />
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
        </Shell>
    );
};
