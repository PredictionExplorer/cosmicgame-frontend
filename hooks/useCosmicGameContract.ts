import { COSMICGAME_ADDRESS } from "../config/app";
import COSMICGAME_ABI from "../contracts/CosmicGame.json";
import useContract from "./useContract";

export default function useCosmicGameContract() {
  return useContract(COSMICGAME_ADDRESS, COSMICGAME_ABI);
}
