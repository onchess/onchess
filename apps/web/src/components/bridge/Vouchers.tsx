import { Stack } from "@mantine/core";
import { Token } from "@onchess/core";
import { FC, PropsWithChildren } from "react";
import { ExecutableVoucher } from "../../hooks/voucher";
import { WithdrawVoucher } from "./WithdrawVoucher";

export type VouchersProps = PropsWithChildren & {
    onExecute: (voucher: ExecutableVoucher) => void;
    token: Token;
    vouchers: ExecutableVoucher[];
};

export const Vouchers: FC<VouchersProps> = (props) => {
    const { onExecute, token, vouchers } = props;
    return (
        <Stack>
            {vouchers.map((voucher, i) => (
                <WithdrawVoucher
                    key={i}
                    executing={false} // XXX: implementing executing
                    onExecute={() => onExecute(voucher)}
                    voucher={voucher}
                    token={token}
                />
            ))}
        </Stack>
    );
};
