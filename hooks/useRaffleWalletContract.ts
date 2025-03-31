import { RAFFLE_WALLET_ADDRESS } from "../config/app";
import RAFFLE_WALLET_ABI from "../contracts/PrizesWallet.json";
import useContract from "./useContract";

export default function useRaffleWalletContract() {
  return useContract(RAFFLE_WALLET_ADDRESS, RAFFLE_WALLET_ABI);
}
