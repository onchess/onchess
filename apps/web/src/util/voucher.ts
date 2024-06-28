import { Address, Hex, decodeFunctionData, erc20Abi, getAddress } from "viem";
import { ExecutableVoucherFragment } from "../__generated__/graphql";

export const destination =
    (token: Address) => (voucher: ExecutableVoucherFragment) =>
        getAddress(voucher.destination) === getAddress(token);

export const transferTo =
    (recipient: Address) => (voucher: ExecutableVoucherFragment) => {
        try {
            const { functionName, args } = decodeFunctionData({
                abi: erc20Abi,
                data: voucher.payload as Hex,
            });
            if (functionName === "transfer") {
                const [to] = args;
                return getAddress(to) === getAddress(recipient);
            } else if (functionName === "transferFrom") {
                const [_, to] = args;
                return getAddress(to) === getAddress(recipient);
            }
        } catch (e: any) {
            return false;
        }
        return false;
    };

export type Proof = {
    context: Hex;
    validity: {
        inputIndexWithinEpoch: bigint;
        machineStateHash: Hex;
        noticesEpochRootHash: Hex;
        outputHashInOutputHashesSiblings: Hex[];
        outputHashesInEpochSiblings: Hex[];
        outputHashesRootHash: Hex;
        outputIndexWithinInput: bigint;
        vouchersEpochRootHash: Hex;
    };
};

export type ExecuteVoucherArgs = [Address, Hex, Proof];

export const toEVM = (
    voucher: ExecutableVoucherFragment,
): ExecuteVoucherArgs => {
    if (!voucher.proof) {
        throw new Error("Voucher proof is missing");
    }

    const destination = getAddress(voucher.destination);
    const payload = voucher.payload as Hex;
    const proof: Proof = {
        context: voucher.proof.context as Hex,
        validity: {
            inputIndexWithinEpoch: BigInt(
                voucher.proof.validity.inputIndexWithinEpoch,
            ),
            machineStateHash: voucher.proof.validity.machineStateHash as Hex,
            noticesEpochRootHash: voucher.proof.validity
                .noticesEpochRootHash as Hex,
            outputHashesInEpochSiblings:
                voucher.proof.validity.outputHashesInEpochSiblings.map(
                    (v) => v as Hex,
                ),
            outputHashesRootHash: voucher.proof.validity
                .outputHashesRootHash as Hex,
            outputIndexWithinInput: BigInt(
                voucher.proof.validity.outputIndexWithinInput,
            ),
            outputHashInOutputHashesSiblings:
                voucher.proof.validity.outputHashInOutputHashesSiblings.map(
                    (v) => v as Hex,
                ),
            vouchersEpochRootHash: voucher.proof.validity
                .vouchersEpochRootHash as Hex,
        },
    };
    return [destination, payload, proof];
};
