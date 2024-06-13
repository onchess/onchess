import {
    ActionIcon,
    CopyButton,
    Group,
    Text,
    TextProps,
    Tooltip,
    rem,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { FC } from "react";
import { Address } from "viem";

export interface AddressTextProps extends TextProps {
    address: Address;
    shorten?: boolean;
    copyButton?: boolean;
}

export const AddressText: FC<AddressTextProps> = (props) => {
    const { address, copyButton = true, shorten = true } = props;
    const text = shorten
        ? address.slice(0, 6).concat("...").concat(address.slice(-4))
        : address;
    return (
        <Group gap={2}>
            <Text {...props}>{text}</Text>
            {copyButton && (
                <CopyButton value={address} timeout={2000}>
                    {({ copied, copy }) => (
                        <Tooltip
                            label={copied ? "Copied" : "Copy"}
                            withArrow
                            position="right"
                        >
                            <ActionIcon
                                color={copied ? "teal" : "gray"}
                                variant="subtle"
                                onClick={copy}
                            >
                                {copied ? (
                                    <IconCheck style={{ width: rem(16) }} />
                                ) : (
                                    <IconCopy style={{ width: rem(16) }} />
                                )}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </CopyButton>
            )}
        </Group>
    );
};
