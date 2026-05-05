import { cosmicSignatureAbi } from '@/contracts/abis';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

export default function useCosmicSignatureContract() {
  const { cosmicSignature } = useContractAddresses();
  return useContract(cosmicSignature, cosmicSignatureAbi);
}
