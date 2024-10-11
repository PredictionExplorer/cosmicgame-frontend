import { STAKING_WALLET_RWLK_ADDRESS } from "../config/app";
import STAKING_WALLET_RWLK_ABI from "../contracts/StakingWalletRWalk.json";
import useContract from "./useContract";

export default function useStakingWalletRWLKContract() {
  return useContract(STAKING_WALLET_RWLK_ADDRESS, STAKING_WALLET_RWLK_ABI);
}
