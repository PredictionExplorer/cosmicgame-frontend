import axios from "axios";

// const baseUrl = "https://randomwalknft-api.com/";
const baseUrl = "http://69.10.55.2/";
const proxyUrl = "/api/proxy?url=";
export const cosmicGameBaseUrl = "http://161.129.67.42:7070/api/cosmicgame/";

const getAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(cosmicGameBaseUrl + url)}`;
};

const getMainAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(baseUrl + url)}`;
};

class ApiService {
  public async create(token_id: number, seed: string, color: string) {
    try {
      const { data } = await axios.post(getMainAPIUrl("cosmicgame_tokens"), { token_id, seed, color });
      return data?.task_id || -1;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  public async get_banned_bids() {
    try {
      const { data } = await axios.get(getMainAPIUrl("get_banned_bids"));
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  public async ban_bid(bid_id: number, user_addr: string) {
    try {
      const { data } = await axios.post(getMainAPIUrl("ban_bid"), { bid_id, user_addr });
      return data;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  public async unban_bid(bid_id: number) {
    try {
      const { data } = await axios.post(getMainAPIUrl("unban_bid"), { bid_id });
      return data;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  public async get_info(token_id: number | string) {
    try {
      const { data } = await axios.get(getMainAPIUrl(`token_info/${token_id}`));
      return data.TokenInfo;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/statistics/dashboard",api_cosmic_game_dashboard)
  public async get_dashboard_info() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/dashboard"));
      return data;
    } catch (err) {
      // console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/bidders",api_cosmic_game_user_unique_bidders)
  public async get_unique_bidders() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/bidders"));
      return data.UniqueBidders;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/winners",api_cosmic_game_user_unique_winners)
  public async get_unique_winners() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/winners"));
      return data.UniqueWinners;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/donors",api_cosmic_game_user_unique_donors)
  public async get_unique_donors() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/donors"));
      return data.UniqueDonors;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/stakers/cst",api_cosmic_game_user_unique_stakers_cst)
  public async get_unique_cst_stakers() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/stakers/cst"));
      return data.UniqueStakersCST;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/stakers/rwalk",api_cosmic_game_user_unique_stakers_rwalk)
  public async get_unique_rwalk_stakers() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/stakers/rwalk"));
      return data.UniqueStakersRWalk;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/stakers/both",api_cosmic_game_user_unique_stakers_both)
  public async get_unique_both_stakers() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/stakers/both"));
      return data.UniqueStakersBoth;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/rounds/list/:offset/:limit",api_cosmic_game_prize_list)
  public async get_round_list() {
    try {
      const { data } = await axios.get(getAPIUrl("rounds/list/0/1000000"));
      return data.Rounds;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/rounds/info/:prize_num",api_cosmic_game_round_info)
  public async get_round_info(roundNum: number) {
    const id = roundNum < 0 ? 0 : roundNum;
    try {
      const { data } = await axios.get(getAPIUrl(`rounds/info/${id}`));
      const prizeInfo = data.RoundInfo;
      return prizeInfo;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/rounds/current/time",api_cosmic_game_prize_cur_round_time)
  public async get_prize_time() {
    try {
      const { data } = await axios.get(getAPIUrl("rounds/current/time"));
      return data.CurRoundPrizeTime;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  // r.GET("/api/cosmicgame/prizes/history/global/:offset/:limit",api_cosmic_game_global_claim_history_detail)
  public async get_claim_history() {
    try {
      const { data } = await axios.get(getAPIUrl("prizes/history/global/0/1000000"));
      return data.GlobalPrizeHistory;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/prizes/history/by_user/:user_addr/:offset/:limit",api_cosmic_game_prize_history_detail_by_user)
  public async get_claim_history_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`prizes/history/by_user/${address}/0/1000000`));
      return data.USerPrizeHistory;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/prizes/deposits/raffle/by_user/:user_addr",api_cosmic_game_prize_deposits_raffle_eth_by_user)
  public async get_raffle_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`prizes/deposits/raffle/by_user/${address}`));
      return data.UserRaffleDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/prizes/deposits/chrono_warrior/by_user/:user_addr",api_cosmic_game_prize_deposits_chrono_warrior_by_user)
  public async get_chrono_warrior_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`prizes/deposits/chrono_warrior/by_user/${address}`));
      return data.UserChronoWarriorDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/prizes/deposits/unclaimed/by_user/:user_addr/:offset/:limit",api_cosmic_game_unclaimed_prize_deposits_by_user)
  public async get_unclaimed_raffle_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`prizes/deposits/unclaimed/by_user/${address}/0/1000000`));
      return data.UnclaimedDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/bid/list/all/:offset/:limit",api_cosmic_game_bid_list)
  public async get_bid_list() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/list/all/0/1000000"));
      return data.Bids;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/bid/info/:evtlog_id",api_cosmic_game_bid_info)
  public async get_bid_info(evtLogID: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`bid/info/${evtLogID}`));
      return data.BidInfo;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/bid/list/by_round/:round_num/:sort/:offset/:limit",api_cosmic_game_bid_list_by_round)
  public async get_bid_list_by_round(round: number, sortDir: string) {
    try {
      const dir = sortDir === 'asc' ? 0 : 1;
      const { data } = await axios.get(getAPIUrl(`bid/list/by_round/${round}/${dir}/0/1000000`));
      return data.BidsByRound;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/bid/used_rwalk_nfts",api_cosmic_game_used_rwalk_nfts)
  public async get_used_rwlk_nfts() {
    try {
      const { data } = await axios.get(getAPIUrl('bid/used_rwalk_nfts'));
      return data.UsedRwalkNFTs;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/bid/cst_price",api_cosmic_game_get_cst_price)
  public async get_ct_price() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/cst_price"));
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/bid/current_special_winners",api_cosmic_game_bid_special_winners)
  public async get_current_special_winners() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/current_special_winners"));
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/cst/list/all/:offset/:limit",api_cosmic_game_cosmic_signature_token_list)
  public async get_cst_list() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/list/all/0/1000000"));
      const cstList = data.CosmicSignatureTokenList;
      return cstList;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/cst/list/by_user/:user_addr/:offset/:limit",api_cosmic_game_cosmic_signature_token_list_by_user)
  public async get_cst_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/list/by_user/${address}/0/1000000`));
      return data.UserTokens;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/cst/info/:token_id",api_cosmic_game_cosmic_signature_token_info)
  public async get_cst_info(tokenId: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
      return data.TokenInfo;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/cst/names/history/:token_id",api_cosmic_game_token_name_history)
  public async get_name_history(token_id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/names/history/${token_id}`));
      return data.TokenNameHistory;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/cst/names/search/:name",api_cosmic_game_token_name_search)
  public async get_token_by_name(token_name: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/names/search/${token_name}`));
      return data.TokenNameSearchResults;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/cst/names/named_only",api_cosmic_game_named_tokens_only)
  public async get_named_nfts() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/names/named_only"));
      return data.NamedTokens;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/cst/transfers/by_user/:user_addr/:offset/:limit",api_cosmic_game_cosmic_signature_transfers_by_user)
  public async get_cst_transfers(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/transfers/by_user/${address}/0/1000000`));
      return data.CosmicSignatureTransfers;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/cst/distribution",api_cosmic_game_cs_token_distribution)
  public async get_cst_distribution() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/distribution"));
      return data.CosmicSignatureTokenDistribution;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/ct/balances",api_cosmic_game_cosmic_token_balances)
  public async get_ct_balances_distribution() {
    try {
      const { data } = await axios.get(getAPIUrl("ct/balances"));
      return data.CosmicTokenBalances;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/ct/transfers/by_user/:user_addr/:offset/:limit",api_cosmic_game_cosmic_token_transfers_by_user)
  public async get_ct_transfers(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`ct/transfers/by_user/${address}/0/1000000`));
      return data.CosmicTokenTransfers;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/cst/transfers/all/:token_id/:offset/:limit",api_cosmic_game_token_ownership_transfers)
  public async get_ct_ownership_transfers(token_id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/transfers/all/${token_id}/0/1000000`));
      return data.TokenTransfers;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/user/info/:user_addr",api_cosmic_game_user_info)
  public async get_user_info(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/info/${address}`));
      return data;
    } catch (err) {
      console.log(err);
      return { Bids: [], UserInfo: null };
    }
  }

  // r.GET("/api/cosmicgame/user/notif_red_box/:user_addr",api_cosmic_game_user_global_winnings)
  public async notify_red_box(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/notif_red_box/${address}`));
      return data.Winnings;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/user/balances/:user_addr",api_cosmic_game_user_balances)
  public async get_user_balance(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/balances/${address}`));
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/simple/list/:offset/:limit",api_cosmic_game_donations_cg_simple_list)
  public async get_donations_cg_simple_list() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/eth/simple/list/0/1000000"));
      return data.DirectCGDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/simple/by_round/:round_num",api_cosmic_game_donations_cg_simple_by_round)
  public async get_donations_cg_simple_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/eth/simple/by_round/${round}`));
      return data.DirectCGDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/with_info/list/:offset/:limit",api_cosmic_game_donations_cg_with_info_list)
  public async get_donations_cg_with_info_list() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/eth/with_info/list/0/1000000"));
      return data.DirectCGDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/with_info/by_round/:round_num",api_cosmic_game_donations_cg_with_info_by_round)
  public async get_donations_cg_with_info_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/by_round/${round}`));
      return data.DirectCGDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/with_info/info/:record_id",api_cosmic_game_donations_cg_with_info_record_info)
  public async get_donations_with_info_by_id(id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/eth/with_info/info/${id}`));
      return data.ETHDonation;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/by_user/:user_addr",api_cosmic_game_donations_by_user)
  public async get_donations_eth_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/eth/by_user/${address}`));
      return data.CombinedDonationRecords;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/both/by_round/:round_num",api_cosmic_game_donations_cg_both_by_round)
  public async get_donations_both_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/eth/both/by_round/${round}`));
      return data.CosmicGameDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/both/all",api_cosmic_game_donations_cg_both_all)
  public async get_donations_both() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/eth/both/all"));
      return data.CosmicGameDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/deposits",api_cosmic_game_charity_donations_deposits)
  public async get_charity_donations_deposits() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/deposits"));
      return data.CharityDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/cg_deposits",api_cosmic_game_charity_cosmicgame_deposits)
  public async get_charity_cg_deposits() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/cg_deposits"));
      return data.CharityDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/voluntary",api_cosmic_game_charity_voluntary_deposits)
  public async get_charity_voluntary() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/voluntary"));
      return data.CharityDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/withdrawals",api_cosmic_game_charity_donations_withdrawals)
  public async get_charity_withdrawals() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/withdrawals"));
      return data.CharityWithdrawals;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/list/:offset/:limit",api_cosmic_game_donations_nft_list)
  public async get_donations_nft_list() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/nft/list/0/1000000"));
      return data.NFTDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/info/:record_id",api_cosmic_game_donated_nft_info)
  public async get_donated_nft_info(record_id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/nft/info/${record_id}`));
      return data.NFTDonation;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/claims/:offset/:limit",api_cosmic_game_donated_nft_claims_all)
  public async get_donated_nft_claims_all() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/nft/claims/0/100000"));
      return data.DonatedNFTClaims;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/claims/by_user/:user_addr",api_cosmic_game_donated_nft_claims_by_user)
  public async get_claimed_donated_nft_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/nft/claims/by_user/${address}`));
      return data.DonatedNFTClaims;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/statistics",api_cosmic_game_nft_donation_stats)
  public async get_nft_donation_stats() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/nft/statistics"));
      return data.NFTDonationStats;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/by_round/:prize_num",api_cosmic_game_nft_donations_by_prize)
  public async get_donations_nft_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/nft/by_round/${round}`));
      return data.NFTDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/unclaimed/by_round/:prize_num",api_cosmic_game_unclaimed_donated_nfts_by_prize)
  public async get_donations_nft_unclaimed_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_round/${round}`));
      return data.NFTDonations;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/unclaimed/by_user/:user_addr",api_cosmic_game_unclaimed_donated_nfts_by_user)
  public async get_unclaimed_donated_nft_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/nft/unclaimed/by_user/${address}`));
      return data.UnclaimedDonatedNFTs;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/erc20/by_round/:round_num",api_cosmic_game_donations_erc20_by_round)
  public async get_donations_erc20_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/erc20/by_round/${round}`));
      return data.DonationsERC20;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/erc20/by_user/:user_addr",api_cosmic_game_donations_erc20_by_user)
  public async get_donations_erc20_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`donations/erc20/by_user/${address}`));
      return data.DonationsERC20ByUser;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/donations/erc20/global/:offset/:limit",api_cosmic_game_donations_erc20_global)

  // r.GET("/api/cosmicgame/donations/erc20/info/:record_id",api_cosmic_game_donated_erc20_info)

  // r.GET("/api/cosmicgame/raffle/deposits/list/:offset/:limit",api_cosmic_game_prize_deposits_list)
  public async get_prize_deposits_list() {
    try {
      const { data } = await axios.get(getAPIUrl("raffle/deposits/list/0/1000000"));
      return data.RaffleDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/raffle/deposits/by_round/:round_num",api_cosmic_game_prize_deposits_by_round)
  public async get_prize_deposits_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`raffle/deposits/by_round/${round}`));
      return data.RaffleDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/raffle/nft/all/list/:offset/:limit",api_cosmic_game_raffle_nft_winners_list)
  public async get_raffle_nft_winners_list() {
    try {
      const { data } = await axios.get(getAPIUrl("raffle/nft/all/list/0/1000000"));
      return data.RaffleNFTWinners;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/raffle/nft/by_round/:round_num",api_cosmic_game_raffle_nft_winners_by_round)
  public async get_raffle_nft_winners_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`raffle/nft/by_round/${round}`));
      return data.RaffleNFTWinners;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/raffle/nft/by_user/:user_addr",api_cosmic_game_user_raffle_nft_winnings)
  public async get_raffle_nft_winnings_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`raffle/nft/by_user/${address}`));
      return data.UserRaffleNFTWinnings;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/to_claim/by_user/:user_addr",api_cosmic_game_staking_cst_rewards_to_claim_by_user)
  public async get_staking_cst_rewards_to_claim_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/to_claim/by_user/${address}`));
      return data.UnclaimedEthDeposits;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/collected/by_user/:user_addr/:offset/:limit",api_cosmic_game_staking_cst_rewards_collected_by_user)
  public async get_staking_cst_rewards_collected_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/collected/by_user/${address}/0/1000000`));
      return data.CollectedStakingCSTRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/staked_tokens/by_user/:user_addr",api_cosmic_game_staked_tokens_cst_by_user)
  public async get_staked_cst_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/staked_tokens/by_user/${address}`));
      return data.StakedTokensCST;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/action_ids_by_deposit/:user_addr/:deposit_id",api_cosmic_game_staking_cst_rewards_action_ids_by_deposit)
  public async get_cst_action_ids_by_deposit_id(user_addr: string, deposit_id: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/action_ids_by_deposit/${user_addr}/${deposit_id}`));
      return data.ActionIdsWithClaimInfo;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/actions/by_user/:user_addr/:offset/:limit",api_cosmic_game_staking_cst_actions_by_user)
  public async get_staking_cst_actions_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/actions/by_user/${address}/0/1000000`));
      return data.StakingCSTActions;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/actions/global/:offset/:limit",api_cosmic_game_staking_actions_cst_global)
  public async get_staking_cst_actions() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/cst/actions/global/0/1000000"));
      return data.StakingCSTActions;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/actions/info/:action_id",api_cosmic_game_staking_action_cst_info)
  public async get_staking_cst_actions_info(actionId: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/actions/info/${actionId}`));
      return data.CombinedStakingRecordInfo;
    } catch (err) {
      console.log(err);
      return { Stake: null, Unstake: null };
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/global",api_cosmic_game_staking_cst_rewards_global)
  public async get_staking_cst_rewards() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/cst/rewards/global"));
      return data.StakingCSTRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/by_round/:round_num",api_cosmic_game_staking_cst_rewards_by_round)
  public async get_staking_cst_rewards_by_round(round: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/by_round/${round}`));
      return data.Rewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/paid/by_user/:user_addr",api_cosmic_game_staking_cst_reward_paid_records_by_user)
  public async get_staking_cst_reward_paid_records_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/paid/by_user/${address}`));
      return data.RewardPaidRecords;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/staked_tokens/all",api_cosmic_game_staked_tokens_cst_global)
  public async get_staked_cst_tokens() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/cst/staked_tokens/all"));
      return data.StakedTokensCST;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/by_user/by_token/summary/:user_addr",api_cosmic_game_staking_cst_by_user_by_token_rewards)
  public async get_staking_rewards_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/by_user/by_token/summary/${address}`));
      return data.RewardsByToken;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/by_user/by_token/details/:user_addr/:token_id",api_cosmic_game_staking_cst_by_user_by_token_rewards_details)
  public async get_staking_rewards_by_user_by_token_details(address: string, tokenId: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/by_user/by_token/details/${address}/${tokenId}`));
      return data.RewardsByTokenDetails;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/by_user/by_deposit/:user_addr",api_cosmic_game_staking_cst_by_user_by_deposit_rewards)
  public async get_staking_cst_by_user_by_deposit_rewards(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/by_user/by_deposit/${address}`));
      return data.RewardsByDeposit;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/actions/info/:action_id",api_cosmic_game_staking_action_rwalk_info)
  public async get_staking_rwalk_actions_info(actionId: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/rwalk/actions/info/${actionId}`));
      return data.CombinedRWalkStakingRecordInfo;
    } catch (err) {
      console.log(err);
      return { Stake: null, Unstake: null };
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/actions/global/:offset/:limit",api_cosmic_game_staking_actions_rwalk_global)
  public async get_staking_rwalk_actions() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/rwalk/actions/global/0/1000000"));
      return data.GlobalStakingActionsRWalk;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/actions/by_user/:user_addr/:offset/:limit",api_cosmic_game_staking_actions_rwalk_by_user)
  public async get_staking_rwalk_actions_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/rwalk/actions/by_user/${address}/0/1000000`));
      return data.UserStakingActionsRWalk;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/mints/global/:offset/:limit",api_cosmic_game_staking_rwalk_mints_global)
  public async get_staking_rwalk_mints_global() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/rwalk/mints/global/0/1000000"));
      return data.StakingRWalkRewardsMints;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/mints/by_user/:user_addr",api_cosmic_game_staking_rwalk_mints_by_user)
  public async get_staking_rwalk_mints_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/rwalk/mints/by_user/${address}`));
      return data.RWalkStakingRewardMints;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/staked_tokens/all",api_cosmic_game_staked_tokens_rwalk_global)
  public async get_staked_rwalk_tokens() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/rwalk/staked_tokens/all"));
      return data.StakedTokensRWalk;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/staked_tokens/by_user/:user_addr",api_cosmic_game_staked_tokens_rwalk_by_user)
  public async get_staked_rwalk_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`staking/rwalk/staked_tokens/by_user/${address}`));
      return data.StakedTokensRWalk;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/marketing/rewards/global/:offset/:limit",api_cosmic_game_marketing_rewards_global)
  public async get_marketing_rewards() {
    try {
      const { data } = await axios.get(getAPIUrl("marketing/rewards/global/0/1000000"));
      return data.MarketingRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/marketing/rewards/by_user/:user_addr/:offset/:limit",api_cosmic_game_marketing_rewards_by_user)
  public async get_marketing_rewards_by_user(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`marketing/rewards/by_user/${address}/0/1000000`));
      return data.UserMarketingRewards;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/time/current",api_cosmic_game_time_current)
  public async get_current_time() {
    try {
      const { data } = await axios.get(getAPIUrl("time/current"));
      return data.CurrentTimeStamp;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  // r.GET("/api/cosmicgame/time/until_prize",api_cosmic_game_time_until_prize)
  public async get_time_until_prize() {
    try {
      const { data } = await axios.get(getAPIUrl("time/until_prize"));
      return data.TimeUntilPrize;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  // r.GET("/api/cosmicgame/system/modelist/:offset/:limit",api_cosmic_game_sysmode_changes)
  public async get_system_modelist() {
    try {
      const { data } = await axios.get(getAPIUrl("system/modelist/0/1000000"));
      return data.SystemModeChanges;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // r.GET("/api/cosmicgame/system/admin_events/:evtlog_start/:evtlog_end",api_cosmic_game_admin_events_in_range)
  public async get_system_events(start: number, end: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`system/admin_events/${start}/${end}`));
      return data.AdminEvents;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

export default new ApiService();


// r.GET("/api/cosmicgame/prizes/deposits/chrono_warrior/by_user/:user_addr",api_cosmic_game_prize_deposits_chrono_warrior_by_user)
// r.GET("/api/cosmicgame/prizes/deposits/unclaimed/by_user/:user_addr/:offset/:limit",api_cosmic_game_unclaimed_prize_deposits_by_user)
// r.GET("/api/cosmicgame/cst/transfers/all/:token_id/:offset/:limit",api_cosmic_game_token_ownership_transfers)
// r.GET("/api/cosmicgame/donations/erc20/global/:offset/:limit",api_cosmic_game_donations_erc20_global)
// r.GET("/api/cosmicgame/donations/erc20/info/:record_id",api_cosmic_game_donated_erc20_info)

// r.GET("/api/cosmicgame/donations/eth/simple/list/:offset/:limit",api_cosmic_game_donations_cg_simple_list)
// r.GET("/api/cosmicgame/donations/eth/simple/by_round/:round_num",api_cosmic_game_donations_cg_simple_by_round)
// r.GET("/api/cosmicgame/donations/eth/with_info/list/:offset/:limit",api_cosmic_game_donations_cg_with_info_list)
// r.GET("/api/cosmicgame/donations/eth/with_info/by_round/:round_num",api_cosmic_game_donations_cg_with_info_by_round)

// r.GET("/api/cosmicgame/donations/charity/deposits",api_cosmic_game_charity_donations_deposits)
// r.GET("/api/cosmicgame/donations/nft/info/:record_id",api_cosmic_game_donated_nft_info)
// r.GET("/api/cosmicgame/donations/nft/claims/:offset/:limit",api_cosmic_game_donated_nft_claims_all)
// r.GET("/api/cosmicgame/donations/nft/statistics",api_cosmic_game_nft_donation_stats)

// r.GET("/api/cosmicgame/donations/erc20/by_round/:round_num",api_cosmic_game_donations_erc20_by_round)
// r.GET("/api/cosmicgame/donations/erc20/by_user/:user_addr",api_cosmic_game_donations_erc20_by_user)



// r.GET("/api/cosmicgame/raffle/deposits/list/:offset/:limit",api_cosmic_game_prize_deposits_list)
// r.GET("/api/cosmicgame/raffle/deposits/by_round/:round_num",api_cosmic_game_prize_deposits_by_round)
// r.GET("/api/cosmicgame/raffle/nft/all/list/:offset/:limit",api_cosmic_game_raffle_nft_winners_list)
// r.GET("/api/cosmicgame/raffle/nft/by_round/:round_num",api_cosmic_game_raffle_nft_winners_by_round)

// r.GET("/api/cosmicgame/staking/cst/rewards/paid/by_user/:user_addr",api_cosmic_game_staking_cst_reward_paid_records_by_user)
// r.GET("/api/cosmicgame/staking/cst/by_user/by_deposit/rewards/:user_addr",api_cosmic_game_staking_cst_by_user_by_deposit_rewards)
// r.GET("/api/cosmicgame/staking/cst/rewards/by_user/by_deposit/:user_addr",api_cosmic_game_staking_cst_by_user_by_deposit_rewards)
// r.GET("/api/cosmicgame/staking/rwalk/mints/global/:offset/:limit",api_cosmic_game_staking_rwalk_mints_global)

