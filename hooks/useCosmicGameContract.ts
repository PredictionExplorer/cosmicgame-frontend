import { cosmicGameAbi } from '@/contracts/abis';

import { COSMICGAME_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useCosmicGameContract() {
  return useContract(COSMICGAME_ADDRESS, cosmicGameAbi);
}
