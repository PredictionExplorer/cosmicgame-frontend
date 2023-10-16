import { COSMIC_SIGNATURE_TOKEN_ADDRESS } from "../config/app";
import COSMICTOKEN_ABI from "../contracts/CosmicToken.json";
import useContract from "./useContract";

export default function useCosmicSignatureTokenContract() {
  return useContract(COSMIC_SIGNATURE_TOKEN_ADDRESS, COSMICTOKEN_ABI);
}
