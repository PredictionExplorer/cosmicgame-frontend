import { stakingWalletRwlkAbi } from '@/contracts/abis';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

export default function useAnchoringWalletRWLKContract() {
  const { stakingRwalk } = useContractAddresses();
  return useContract(stakingRwalk, stakingWalletRwlkAbi);
}
