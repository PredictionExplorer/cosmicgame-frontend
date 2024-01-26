import axios from "axios";

const baseUrl = "https://randomwalknft-api.com/";
const proxyUrl = "/api/proxy?url=";
export const cosmicGameBaseUrl = "http://170.187.142.12:9191/api/cosmicgame/";

const getAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(cosmicGameBaseUrl + url)}`;
};

class ApiService {
  public async create(token_id: number, seed: string) {
    try {
      const { data } = await axios.post(baseUrl + "cosmicgame_tokens", { token_id, seed });
      return data?.task_id || -1;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  public async get_bid_list() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/list/0/1000000"));
      return data.Bids;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_bid_list_by_round(round: number, sortDir: string) {
    try {
      const dir = sortDir === 'asc' ? 0 : 1;
      const { data } = await axios.get(getAPIUrl(`bid/list_by_round/${round}/${dir}/0/1000000`));
      return data.BidsByRound;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_bid_info(evtLogID: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`bid/info/${evtLogID}`));
      return data.BidInfo;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async get_dashboard_info() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/dashboard"));
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async get_unique_bidders() {
    try {
      const { data } = await axios.get(getAPIUrl("user/unique_bidders"));
      return data.UniqueBidders;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_unique_winners() {
    try {
      const { data } = await axios.get(getAPIUrl("user/unique_winners"));
      return data.UniqueWinners;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_donations_nft_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/nft/by_prize/${round}`));
      if (data.status === 0) return [];
      return data.NFTDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_donations_nft_unclaimed_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed_by_prize/${round}`));
      if (data.status === 0) return [];
      return data.NFTDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_donations_nft_list() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/nft/list/0/1000000"));
      return data.NFTDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_claimed_donated_nft_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/nft/claims/${address}`));
      return data.DonatedNFTClaims;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_unclaimed_donated_nft_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/nft/unclaimed_by_user/${address}`));
      return data.UnclaimedDonatedNFTs;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_unclaimed_raffle_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/unclaimed_raffle_deposits/${address}/0/1000000`));
      return data.UnclaimedDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_prize_list() {
    try {
      const { data } = await axios.get(getAPIUrl("prize/list/0/1000000"));
      return data.PrizeClaims;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_prize_info(roundNum: number) {
    const id = roundNum < 0 ? 0 : roundNum;
    try {
      const { data } = await axios.get(getAPIUrl(`prize/info/${id}`));
      const prizeInfo = data.PrizeInfo;
      return prizeInfo;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async get_cst_list() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/list/0/1000000"));
      const cstList = data.CosmicSignatureTokenList;
      return cstList;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_cst_list_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/list_by_user/${address}/0/1000000`));
      return data.UserTokens;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_cst_info(tokenId: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async get_user_info(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/info/${address}`));
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async get_raffle_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/raffle_deposits/${address}`));
      return data.UserRaffleDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_info(token_id: number | string) {
    try {
      const { data } = await axios.get(baseUrl + "token_info/" + token_id);
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async notify_red_box(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/notif_red_box/${address}`));
      return data.Winnings;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async get_name_history(token_id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/names/history/${token_id}`));
      return data.TokenNameHistory;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_token_by_name(token_name: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/names/search/${token_name}`));
      return data.TokenNameSearchResults;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_transfer_history(token_id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/transfers/${token_id}/0/10000`));
      return data.TokenTransfers;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_claim_history() {
    try {
      const { data } = await axios.get(getAPIUrl("prize/claim_history/0/100000"));
      return data.GlobalClaimHistory;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_claim_history_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/claim_history/${address}/0/100000`));
      return data.ClaimHistory;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_prize_time() {
    try {
      const { data } = await axios.get(getAPIUrl("prize/cur_round/time"));
      return data.CurRoundPrizeTime;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  public async get_charity_cg_deposits() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/cg_deposits"));
      return data.CharityDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_charity_voluntary() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/voluntary"));
      return data.CharityDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_charity_withdrawals() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/withdrawals"));
      return data.CharityWithdrawals;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_named_nfts() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/names/named_only"));
      return data.NamedTokens;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_cst_distribution() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/distribution"));
      return data.CosmicSignatureTokenDistribution;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_ct_balances_distribution() {
    try {
      const { data } = await axios.get(getAPIUrl("ct/balances"));
      return data.CosmicTokenBalances;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_user_balance(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/balances/${address}`));
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  public async get_ct_transfers(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/cosmictoken/transfers/${address}/0/1000`));
      return data.CosmicTokenTransfers;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_cst_transfers(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/cosmicsignature/transfers/${address}/0/1000`));
      return data.CosmicSignatureTransfers;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_used_rwlk_nfts() {
    try {
      const { data } = await axios.get(getAPIUrl('bid/used_rwalk_nfts'));
      return data.UsedRwalkNFTs;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_unclaimed_staking_rewards_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/rewards/to_claim/by_user/${address}`));
      return data.UnclaimedEthDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_collected_staking_rewards_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/rewards/collected/by_user/${address}/0/10000`));
      return data.CollectedStakingRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_staking_actions_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/actions/by_user/${address}/0/10000`));
      return data.StakingActions;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_staking_actions() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/actions/global/0/10000"));
      return data.StakingActions;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_marketing_rewards() {
    try {
      const { data } = await axios.get(getAPIUrl("marketing/rewards/global/0/10000"));
      return data.MarketingRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_marketing_rewards_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`marketing/rewards/by_user/${address}/0/10000`));
      return data.UserMarketingRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_staked_tokens() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/staked"));
      return data.StakedTokens;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_staked_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/nft/staked/${address}`));
      return data.StakedTokens;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_action_id_by_deposit_id(user_addr: string, deposit_id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/rewards/action_ids_by_deposit/${user_addr}/${deposit_id}`));
      if (data.ActionIds.length) {
        return data.ActionIds[0].StakeActionId;
      }
      return -1;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  public async get_cst_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/list_by_user/${address}/0/10000`));
      return data.UserTokens;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_staking_rewards() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/rewards/global/0/10000"));
      return data.StakingRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_unique_stakers() {
    try {
      const { data } = await axios.get(getAPIUrl("user/unique_stakers"));
      return data.UniqueStakers;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async get_cst_price() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/cst_price"));
      return data.CSTPrice;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }
}

export default new ApiService();
