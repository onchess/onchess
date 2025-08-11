import { useApplication } from "@cartesi/wagmi";
import type { Address } from "viem";

const applicationName = process.env.NEXT_PUBLIC_APPLICATION_NAME || "onchess";

export const useApplicationAddress = (): Address | undefined => {
    const { data: application } = useApplication({
        application: applicationName,
    });
    return application?.applicationAddress;
};
