import { ART_BLOCKS_ADDRESS } from '@/config/networks';
import { artBlocksAbi } from '@/contracts/abis';

import useContract from './useContract';

export default function useArtBlocksContract() {
  return useContract(ART_BLOCKS_ADDRESS, artBlocksAbi);
}
