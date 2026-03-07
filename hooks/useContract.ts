import { Contract } from "@ethersproject/contracts";
import { useEffect, useMemo, useState } from "react";
import { useActiveWeb3React } from "./web3";

export default function useContract<T extends Contract = Contract>(
  address: string,
  ABI: any
): T | null {
  const { library, account, chainId } = useActiveWeb3React();
  const [byteCode, setByteCode] = useState("");

  useEffect(() => {
    if (!library) return;

    let cancelled = false;

    const getByteCode = async () => {
      try {
        const code = await library.getCode(address);
        if (!cancelled) setByteCode(code);
      } catch (e) {
        console.error("Failed to fetch contract bytecode:", e);
      }
    };

    getByteCode();

    return () => { cancelled = true; };
  }, [address, library]);

  return useMemo(() => {
    if (!address || !ABI || !library || !chainId || byteCode.length <= 2) {
      return null;
    }
    try {
      return account
        ? new Contract(address, ABI, library.getSigner(account))
        : new Contract(address, ABI, library);
    } catch (error) {
      console.error("Failed to create contract instance:", error);
      return null;
    }
    // chainId added so the contract instance re-creates on network switch
  }, [address, ABI, library, account, chainId, byteCode]) as T;
}
