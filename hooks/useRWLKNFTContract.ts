import { randomWalkNftAbi } from '@/contracts/abis';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

export default function useRWLKNFTContract() {
  const { randomWalkNft } = useContractAddresses();
  return useContract(randomWalkNft, randomWalkNftAbi);
}
