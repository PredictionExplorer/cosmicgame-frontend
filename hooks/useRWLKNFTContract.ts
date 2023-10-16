import { NFT_ADDRESS } from "../config/app";
import NFT_ABI from "../contracts/RandomWalkNFT.json";
import useContract from "./useContract";

export default function useRWLKNFTContract() {
  return useContract(NFT_ADDRESS, NFT_ABI);
}
