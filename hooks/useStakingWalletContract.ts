import { STAKING_WALLET_ADDRESS } from "../config/app";
import STAKING_WALLET_ABI from "../contracts/StakingWallet.json";
import useContract from "./useContract";

export default function useStakingWalletContract() {
  return useContract(STAKING_WALLET_ADDRESS, STAKING_WALLET_ABI);
}
