import { STAKING_WALLET_CST_ADDRESS } from "../config/app";
import STAKING_WALLET_CST_ABI from "../contracts/StakingWalletCST.json";
import useContract from "./useContract";

export default function useStakingWalletCSTContract() {
  return useContract(STAKING_WALLET_CST_ADDRESS, STAKING_WALLET_CST_ABI);
}
