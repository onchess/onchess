import { Token } from "@onchess/core";
import { FC } from "react";
import { getAddress } from "viem";
import { ExecutableVoucher } from "../../hooks/voucher";
import { ERC20Voucher } from "./ERC20Voucher";

export type WithdrawVoucherProps = {
    executing: boolean;
    onExecute: () => void;
    voucher: ExecutableVoucher;
    token: Token;
};

export const WithdrawVoucher: FC<WithdrawVoucherProps> = (props) => {
    const { executing, onExecute, token, voucher } = props;
    const { destination } = voucher;
    if (getAddress(destination) === getAddress(token.address)) {
        return (
            <ERC20Voucher
                executing={executing}
                onExecute={onExecute}
                token={token}
                voucher={voucher}
            />
        );
    }
    return null;
};
