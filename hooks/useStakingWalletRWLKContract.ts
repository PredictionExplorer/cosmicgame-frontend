import { STAKING_WALLET_RWLK_ADDRESS } from '../config/networks';
import { stakingWalletRwlkAbi } from '../contracts/abis';

import useContract from './useContract';

export default function useStakingWalletRWLKContract() {
  return useContract(STAKING_WALLET_RWLK_ADDRESS, stakingWalletRwlkAbi);
}
