import { useEffect, useState } from "react";
import { useCapabilities, useChainId } from "wagmi";

export const useAtomicBatchSupport = () => {
    const chainId = useChainId();
    const capabilities = useCapabilities();
    const [supported, setSupported] = useState<boolean | undefined>(undefined);
    useEffect(() => {
        switch (capabilities.status) {
            case "error": {
                setSupported(false);
                break;
            }
            case "pending": {
                setSupported(undefined);
                break;
            }
            case "success": {
                if (
                    capabilities.data &&
                    chainId &&
                    capabilities.data[chainId]
                ) {
                    const chainCapabilities = capabilities.data[chainId];
                    const { atomicBatch } = chainCapabilities; // TODO: changed to atomic
                    setSupported(atomicBatch?.supported || false);
                } else {
                    setSupported(false);
                }
                break;
            }
        }
    }, [capabilities.status, chainId]);
    return { ...capabilities, supported };
};

export const usePermissionsSupport = () => {
    const chainId = useChainId();
    const capabilities = useCapabilities();
    const [supported, setSupported] = useState<boolean | undefined>(undefined);
    const [permissionTypes, setPermissionTypes] = useState<string[]>([]);
    useEffect(() => {
        switch (capabilities.status) {
            case "error": {
                setSupported(false);
                break;
            }
            case "pending": {
                setSupported(undefined);
                break;
            }
            case "success": {
                if (
                    capabilities.data &&
                    chainId &&
                    capabilities.data[chainId]
                ) {
                    const chainCapabilities = capabilities.data[chainId];
                    const { permissions } = chainCapabilities;
                    setSupported(permissions?.supported || false);
                    setPermissionTypes(permissions?.permissionTypes || []);
                } else {
                    setSupported(false);
                    setPermissionTypes([]);
                }
                break;
            }
        }
    }, [capabilities.status, chainId]);
    return { ...capabilities, supported, permissionTypes };
};

export const usePaymasterServiceSupport = () => {
    const chainId = useChainId();
    const capabilities = useCapabilities();
    const [supported, setSupported] = useState<boolean | undefined>(undefined);
    useEffect(() => {
        switch (capabilities.status) {
            case "error": {
                setSupported(false);
                break;
            }
            case "pending": {
                setSupported(undefined);
                break;
            }
            case "success": {
                if (
                    capabilities.data &&
                    chainId &&
                    capabilities.data[chainId]
                ) {
                    const chainCapabilities = capabilities.data[chainId];
                    const { paymasterService } = chainCapabilities;
                    setSupported(paymasterService?.supported || false);
                } else {
                    setSupported(false);
                }
                break;
            }
        }
    }, [capabilities.status, chainId]);
    return { ...capabilities, supported };
};
