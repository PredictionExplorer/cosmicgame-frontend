import { artBlocksAbi } from '@/contracts/abis';

import { ART_BLOCKS_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useArtBlocksContract() {
  return useContract(ART_BLOCKS_ADDRESS, artBlocksAbi);
}
