import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { RPC_URL } from '../config/app'

export default function useContract<T extends Contract = Contract>(
  address: string,
  ABI: any,
): T | null {
  return useMemo(() => {
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL)
    try {
        return new Contract(address, ABI, jsonRpcProvider)
    } catch (error) {
      console.error('Failed To Get Contract', error)
      return null
    }
  }, [address, ABI]) as T
}
