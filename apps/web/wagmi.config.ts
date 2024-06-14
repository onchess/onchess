import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { erc20Abi } from "viem";

export default defineConfig({
    out: "src/hooks/contracts.tsx",
    contracts: [
        {
            abi: erc20Abi,
            name: "erc20",
        },
    ],
    plugins: [
        hardhatDeploy({
            directory: "node_modules/@cartesi/rollups/export/abi",
        }),
        react(),
    ],
});
