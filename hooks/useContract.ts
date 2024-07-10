import { Contract } from '@ethersproject/contracts'
import { useEffect, useMemo, useState } from 'react'

import { useActiveWeb3React } from './web3'

export default function useContract<T extends Contract = Contract>(
  address: string,
  ABI: any,
): T | null {
  const { library, account, chainId } = useActiveWeb3React()
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
    if (!address || !ABI || !library || !chainId || byteCode.length <= 2) {
      return null
    }

    try {
      if (account) {
        return new Contract(address, ABI, library.getSigner(account))
      } else {
        return new Contract(address, ABI, library)
      }
    } catch (error) {
      console.error('Failed To Get Contract', error)

      return null
    }
  }, [address, ABI, library, account, byteCode]) as T
}
