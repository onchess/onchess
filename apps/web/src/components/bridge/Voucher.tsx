import { Token } from "@onchess/core";
import { FC } from "react";
import { Address, Hex } from "viem";
import { ERC20Voucher } from "./ERC20Voucher";

export type VoucherProps = {
    destination: Address;
    payload: Hex;
    token: Token;
};

export const Voucher: FC<VoucherProps> = ({ destination, payload, token }) => {
    if (destination === token.address) {
        return (
            <ERC20Voucher
                payload={payload}
                token={token}
                executed={undefined}
            />
        );
    }
    return null;
};
