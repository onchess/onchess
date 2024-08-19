import type { Output } from "@cartesi/viem";
import { useOutputs } from "@cartesi/wagmi";
import { useEffect, useState } from "react";
import { useApplicationAddress } from "./config";

export type ExecutableVoucher = Output & {
    executable: boolean;
    executed: boolean;
};

export type UseVouchersResponse = {
    loading: boolean;
    data: ExecutableVoucher[];
};

export const useVouchers = (): UseVouchersResponse => {
    const application = useApplicationAddress();
    const [data, setData] = useState<ExecutableVoucher[]>([]);
    const [loading, setLoading] = useState(true);

    const { data: outputs } = useOutputs({
        application,
        outputType: "Voucher",
    });

    // XXX: handle multiple pages
    // XXX: handle epoch closing (executable status)
    useEffect(() => {
        if (outputs) {
            const vouchers: ExecutableVoucher[] = outputs.data.map(
                (output) => ({
                    ...output,
                    executable:
                        output.outputHashesSiblings != null &&
                        output.outputHashesSiblings.length > 0,
                    executed: !!output.executionTransactionHash,
                }),
            );
            setData(vouchers);
        }
    }, [outputs]);

    return {
        data,
        loading,
    };
};
