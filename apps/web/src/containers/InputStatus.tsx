import { useInput } from "@cartesi/wagmi";
import { Collapse } from "@mantine/core";
import type { FC } from "react";
import type { Address } from "viem";
import { InputStatus as InputStatusComponent } from "../components/wallet/InputStatus";

export const InputStatus: FC<{
    application: Address | string;
    inputIndex: bigint;
    message?: string;
}> = (props) => {
    const { application, inputIndex, message } = props;
    const { isSuccess } = useInput({
        application,
        inputIndex,
        retry: true,
        retryDelay: 2000,
    });
    return (
        <Collapse in={!isSuccess}>
            <InputStatusComponent inputIndex={inputIndex} message={message} />
        </Collapse>
    );
};
