import { Contract } from '@ethersproject/contracts'
import { useEffect, useMemo, useState } from 'react'
import { getNetworkLibrary } from '../connectors';

export default function useContractNoSigner<T extends Contract = Contract>(
  address: string,
  ABI: any,
): T | null {
  const library = getNetworkLibrary();
  const [byteCode, setByteCode] = useState("");
  useEffect(() => {
    const getByteCode = async (address) => {
      const code = await library.getCode(address);
      setByteCode(code);
    }
    if (library) {
      getByteCode(address);
    }
  }, [address, library]);

  return useMemo(() => {
    if (!address || !ABI || !library || byteCode.length <= 2) {
      return null
    }

    try {
      return new Contract(address, ABI, library)
    } catch (error) {
      console.error('Failed To Get Contract', error)

      return null
    }
  }, [address, ABI, library, byteCode]) as T
}
