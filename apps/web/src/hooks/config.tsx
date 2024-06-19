import { Address } from "viem";
import { baseSepolia, foundry } from "viem/chains";
import { useChainId } from "wagmi";

export const useApplicationAddress = (): Address | undefined => {
    const chainId = useChainId();
    switch (chainId) {
        case baseSepolia.id:
            return "0xc93796ff6ED6B8D15D68eCB793DF221ECf042774";
        case foundry.id:
            return "0xab7528bb862fB57E8A2BCd567a2e929a0Be56a5e";
    }
};
