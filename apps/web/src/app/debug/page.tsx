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
import { ABI } from "@onchess/core";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { FC } from "react";
import { encodeFunctionData, zeroAddress } from "viem";
import { prepareCalls } from "viem/experimental";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { Shell } from "../../components/navigation/Shell";
import {
    useAtomicBatchSupport,
    usePaymasterServiceSupport,
    usePermissionsSupport,
} from "../../hooks/capabilities";
import { useClock } from "../../hooks/clock";
import { useApplicationAddress } from "../../hooks/config";
import {
    inputBoxAbi,
    permissionCallableInputBoxAddress,
} from "../../hooks/contracts";
import { useSession } from "../../hooks/session";
import { useLatestState } from "../../hooks/state";

export default () => {
    const now = useClock();
    const { inputIndex, loading, state } = useLatestState(2000);
    const applicationAddress = useApplicationAddress();

    // wallet actions
    const { address, chain, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();

    // wallet capabilities
    const { context, credential, expiry, requestPermissionsAsync } =
        useSession();
    const { supported: atomicBatchSupported } = useAtomicBatchSupport();
    const { supported: permissionsSupported } = usePermissionsSupport();
    const { supported: paymasterServiceSupported } =
        usePaymasterServiceSupport();

    const prepareAddInput = async () => {
        if (applicationAddress && walletClient) {
            const payload = encodeFunctionData({
                abi: ABI,
                functionName: "move",
                args: [zeroAddress, "h6"],
            });
            const [
                { context: preparedContext, preparedCalls, signatureRequest },
            ] = await prepareCalls(walletClient, {
                account: address,
                chain,
                calls: [
                    {
                        to: permissionCallableInputBoxAddress,
                        data: encodeFunctionData({
                            abi: inputBoxAbi,
                            functionName: "addInput",
                            args: [applicationAddress, payload],
                        }),
                    },
                ],
                capabilities: {
                    permissions: { context },
                },
            });
            console.log("context", preparedContext);
            console.log("preparedCalls", preparedCalls);
            console.log("signatureRequest", signatureRequest);
        }
    };

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
                <Text>Context</Text>
                <TextInput readOnly value={context} width={600} />
                <Button onClick={() => requestPermissionsAsync(now + 3600)}>
                    Request Permissions
                </Button>
                <Button onClick={() => prepareAddInput()}>
                    Prepare addInput
                </Button>
            </Group>
            <Group>
                <Text>Credential</Text>
                <Text>{credential?.publicKey}</Text>
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
