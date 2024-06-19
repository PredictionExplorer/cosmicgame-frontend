import { ART_BLOCKS_ADDRESS } from "../config/app";
import ARTBLOCKS_ABI from "../contracts/ArtBlocks.json";
import useContract from "./useContract";

export default function useArtBlocksContract() {
  return useContract(ART_BLOCKS_ADDRESS, ARTBLOCKS_ABI);
}
