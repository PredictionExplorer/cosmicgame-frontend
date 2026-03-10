import { RAFFLE_WALLET_ADDRESS } from '../config/networks';
import { prizesWalletAbi } from '../contracts/abis';

import useContract from './useContract';

export default function useRaffleWalletContract() {
  return useContract(RAFFLE_WALLET_ADDRESS, prizesWalletAbi);
}
