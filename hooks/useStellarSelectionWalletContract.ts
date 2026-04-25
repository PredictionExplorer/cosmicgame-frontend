import { prizesWalletAbi } from '@/contracts/abis';

import { STELLAR_SELECTION_WALLET_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useStellarSelectionWalletContract() {
  return useContract(STELLAR_SELECTION_WALLET_ADDRESS, prizesWalletAbi);
}
