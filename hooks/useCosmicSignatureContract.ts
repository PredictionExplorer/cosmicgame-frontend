import { COSMIC_SIGNATURE_ADDRESS } from "../config/app";
import COSMICSIGNATURE_ABI from "../contracts/CosmicSignature.json";
import useContract from "./useContract";

export default function useCosmicSignatureContract() {
  return useContract(COSMIC_SIGNATURE_ADDRESS, COSMICSIGNATURE_ABI);
}
