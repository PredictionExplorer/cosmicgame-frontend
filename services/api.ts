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

  public async get_raffle_nft_winners_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/raffle_nft_winnings/${address}`));
      return data.UserRaffleNFTWinnings;
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
      const { data } = await axios.get(getAPIUrl(`cst/names/${token_id}`));
      return data.TokenNameHistory;
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

  public async get_current_time() {
    try {
      const { data } = await axios.get(getAPIUrl("time/current"));
      return data.CurrentTimeStamp;
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
      return 0;
    }
  }

  public async get_charity_voluntary() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/voluntary"));
      return data.CharityDonations;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  public async get_charity_withdrawals() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/withdrawals"));
      return data.CharityWithdrawals;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }
}

export default new ApiService();
