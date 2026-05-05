import { cosmicGameAbi } from '@/contracts/abis';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

export default function useCosmicGameContract() {
  const { cosmicGame } = useContractAddresses();
  return useContract(cosmicGame, cosmicGameAbi);
}
