import { randomWalkNftAbi } from '@/contracts/abis';

import { NFT_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useRWLKNFTContract() {
  return useContract(NFT_ADDRESS, randomWalkNftAbi);
}
