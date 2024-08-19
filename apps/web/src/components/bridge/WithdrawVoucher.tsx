import type { Token } from "@onchess/core";
import type { FC } from "react";
import { getAddress } from "viem";
import type { ExecutableVoucher } from "../../hooks/voucher";
import { ERC20Voucher } from "./ERC20Voucher";

export type WithdrawVoucherProps = {
    executing: boolean;
    onExecute: () => void;
    voucher: ExecutableVoucher;
    token: Token;
};

export const WithdrawVoucher: FC<WithdrawVoucherProps> = (props) => {
    const { executing, onExecute, token, voucher } = props;
    if (
        voucher.decodedData.type === "Voucher" &&
        getAddress(voucher.decodedData.destination) ===
            getAddress(token.address)
    ) {
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
