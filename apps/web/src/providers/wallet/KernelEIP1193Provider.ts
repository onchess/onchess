import type { KernelAccountClient } from "@zerodev/sdk";
import { EventEmitter } from "events";
import type {
    Address,
    EIP1193Parameters,
    EIP1193RequestFn,
    Hash,
    Hex,
    SendTransactionParameters,
} from "viem";
import { hexToBigInt } from "viem";
import {
    EstimateUserOperationGasParameters,
    EstimateUserOperationGasReturnType,
    GetUserOperationParameters,
    GetUserOperationReceiptParameters,
    SendUserOperationParameters,
    UserOperation,
    UserOperationReceipt,
} from "viem/account-abstraction";

export class KernelEIP1193Provider extends EventEmitter {
    private kernelClient: KernelAccountClient;

    constructor(kernelClient: KernelAccountClient) {
        super();
        this.kernelClient = kernelClient;
    }

    async request({
        method,
        params = [],
    }: EIP1193Parameters): ReturnType<EIP1193RequestFn> {
        switch (method) {
            case "eth_requestAccounts":
                return this.handleEthRequestAccounts();
            case "eth_accounts":
                return this.handleEthAccounts();
            case "eth_sendTransaction":
                return this.handleEthSendTransaction(params);
            case "eth_sign":
                return this.handleEthSign(params as [string, string]);
            case "personal_sign":
                return this.handlePersonalSign(params as [string, string]);
            case "eth_signTypedData":
            case "eth_signTypedData_v4":
                return this.handleEthSignTypedDataV4(
                    params as [string, string],
                );
            case "eth_getUserOperationReceipt":
                return this.handleEthGetUserOperationReceipt(
                    params as GetUserOperationReceiptParameters,
                );
            case "eth_supportedEntryPoints":
                return this.handleEthSupportedEntryPoints();
            case "eth_getUserOperationByHash":
                return this.handleEthGetUserOperationByHash(
                    params as GetUserOperationParameters,
                );
            case "eth_sendUserOperation":
                return this.handleEthSendUserOperation(
                    params as SendUserOperationParameters,
                );
            case "eth_estimateUserOperationGas":
                return this.handleEthEstimateUserOperationGas(
                    params as EstimateUserOperationGasParameters,
                );
            default:
                return this.kernelClient.transport.request({ method, params });
        }
    }

    private async handleEthRequestAccounts(): Promise<string[]> {
        if (!this.kernelClient.account) {
            return [];
        }
        return [this.kernelClient.account.address];
    }

    private async handleEthAccounts(): Promise<string[]> {
        if (!this.kernelClient.account) {
            return [];
        }
        return [this.kernelClient.account.address];
    }

    private async handleEthSendTransaction(params: unknown): Promise<Hash> {
        const [tx] = params as [
            Omit<SendTransactionParameters, "value"> & { value?: Hex },
        ];
        return this.kernelClient.sendTransaction({
            ...tx,
            value: tx.value ? hexToBigInt(tx.value) : undefined,
        } as SendTransactionParameters);
    }

    private async handleEthSign(params: [string, string]): Promise<string> {
        if (!this.kernelClient?.account) {
            throw new Error("account not connected!");
        }
        const [address, message] = params;
        if (
            address.toLowerCase() !==
            this.kernelClient.account.address.toLowerCase()
        ) {
            throw new Error(
                "cannot sign for address that is not the current account",
            );
        }

        return this.kernelClient.signMessage({
            message,
            account: this.kernelClient.account,
        });
    }

    private async handlePersonalSign(
        params: [string, string],
    ): Promise<string> {
        if (!this.kernelClient?.account) {
            throw new Error("account not connected!");
        }
        const [message, address] = params;
        if (
            address.toLowerCase() !==
            this.kernelClient.account.address.toLowerCase()
        ) {
            throw new Error(
                "cannot sign for address that is not the current account",
            );
        }

        return this.kernelClient.signMessage({
            message,
            account: this.kernelClient.account,
        });
    }

    private async handleEthSignTypedDataV4(
        params: [string, string],
    ): Promise<string> {
        if (!this.kernelClient?.account) {
            throw new Error("account not connected!");
        }
        const [address, typedDataJSON] = params;
        const typedData = JSON.parse(typedDataJSON);
        if (
            address.toLowerCase() !==
            this.kernelClient.account.address.toLowerCase()
        ) {
            throw new Error(
                "cannot sign for address that is not the current account",
            );
        }

        return this.kernelClient.signTypedData({
            account: this.kernelClient.account,
            domain: typedData.domain,
            types: typedData.types,
            message: typedData.message,
            primaryType: typedData.primaryType,
        });
    }

    private async handleEthGetUserOperationReceipt(
        params: GetUserOperationReceiptParameters,
    ): Promise<UserOperationReceipt> {
        return this.kernelClient.getUserOperationReceipt(params);
    }

    private async handleEthSupportedEntryPoints(): Promise<readonly Address[]> {
        return this.kernelClient.getSupportedEntryPoints();
    }

    private async handleEthGetUserOperationByHash(
        params: GetUserOperationParameters,
    ): Promise<UserOperation> {
        const userOp = await this.kernelClient.getUserOperation(params);
        return userOp.userOperation;
    }

    private async handleEthSendUserOperation(
        params: SendUserOperationParameters,
    ): Promise<Hash> {
        return this.kernelClient.sendUserOperation(params);
    }

    private async handleEthEstimateUserOperationGas(
        params: EstimateUserOperationGasParameters,
    ): Promise<EstimateUserOperationGasReturnType> {
        return this.kernelClient.estimateUserOperationGas(params);
    }
}
