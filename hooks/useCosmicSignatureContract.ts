import { cosmicSignatureAbi } from '@/contracts/abis';

import { COSMIC_SIGNATURE_ADDRESS } from '@/config/networks';

import useContract from './useContract';

export default function useCosmicSignatureContract() {
  return useContract(COSMIC_SIGNATURE_ADDRESS, cosmicSignatureAbi);
}
