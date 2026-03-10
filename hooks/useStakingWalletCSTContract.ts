import { STAKING_WALLET_CST_ADDRESS } from '../config/networks';
import { stakingWalletCstAbi } from '../contracts/abis';

import useContract from './useContract';

export default function useStakingWalletCSTContract() {
  return useContract(STAKING_WALLET_CST_ADDRESS, stakingWalletCstAbi);
}
