import { prizesWalletAbi } from '@/contracts/abis';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

export default function useStellarSelectionWalletContract() {
  const { prizesWallet } = useContractAddresses();
  return useContract(prizesWallet, prizesWalletAbi);
}
