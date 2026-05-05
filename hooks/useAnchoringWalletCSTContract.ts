import { stakingWalletCstAbi } from '@/contracts/abis';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

export default function useAnchoringWalletCSTContract() {
  const { stakingCst } = useContractAddresses();
  return useContract(stakingCst, stakingWalletCstAbi);
}
