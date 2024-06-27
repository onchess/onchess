import { Voucher } from "@deroll/core";
import { Stack } from "@mantine/core";
import { Player, Token } from "@onchess/core";
import { FC } from "react";
import { Hex } from "viem";
import { destination, transferTo } from "../../util/voucher";
import { Voucher as VoucherComponent } from "./Voucher";

export type VoucherProps = {
    player: Player;
    token: Token;
    vouchers: Voucher[];
};

export const Vouchers: FC<VoucherProps> = ({ player, token, vouchers }) => {
    // filter only vouchers that are ERC-20 transfers to the player
    const playerVouchers = vouchers
        .filter(destination(token.address))
        .filter(transferTo(player.address));

    return (
        <Stack>
            {playerVouchers.map((voucher, i) => (
                <VoucherComponent
                    destination={voucher.destination}
                    payload={voucher.payload as Hex}
                    key={i}
                    token={token}
                />
            ))}
        </Stack>
    );
};
