import { NFT_ADDRESS } from '../config/networks';
import { randomWalkNftAbi } from '../contracts/abis';

import useContract from './useContract';

export default function useRWLKNFTContract() {
  return useContract(NFT_ADDRESS, randomWalkNftAbi);
}
