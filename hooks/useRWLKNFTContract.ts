import { randomWalkNftAbi } from '@/contracts/abis';

import useContract from './useContract';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

export default function useRWLKNFTContract() {
  const { randomWalkNft } = useContractAddresses();
  return useContract(randomWalkNft, randomWalkNftAbi);
}
