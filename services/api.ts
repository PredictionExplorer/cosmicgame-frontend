import axios from "axios";

// const baseUrl = "https://randomwalknft-api.com/";
const baseUrl = "https://nfts.cosmicsignature.com/";
const proxyUrl = "/api/proxy?url=";
export const cosmicGameBaseUrl = "http://161.129.67.42:8353/api/cosmicgame/";

const getAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(cosmicGameBaseUrl + url)}`;
};

const getMainAPIUrl = (url: string) => {
  return `${proxyUrl}${encodeURIComponent(baseUrl + url)}`;
};

// Helper function to flatten nested Tx object to top level
const flattenTx = (item: any) => {
  if (!item) return item;
  if (item.Tx && typeof item.Tx === 'object') {
    const { Tx, ...rest } = item;
    return {
      ...rest,
      EvtLogId: Tx.EvtLogId,
      BlockNum: Tx.BlockNum,
      TxId: Tx.TxId,
      TxHash: Tx.TxHash,
      TimeStamp: Tx.TimeStamp,
      DateTime: Tx.DateTime,
    };
  }
  return item;
};

// Helper to flatten array of items with nested Tx
const flattenTxArray = (items: any[]) => {
  if (!Array.isArray(items)) return items;
  return items.map(flattenTx);
};

// Helper to flatten RoundInfo response structure
const flattenRoundInfo = (roundInfo: any) => {
  if (!roundInfo) return null;
  
  const {
    ClaimPrizeTx,
    MainPrize,
    CharityDeposit,
    StakingDeposit,
    EnduranceChampion,
    LastCstBidder,
    ChronoWarrior,
    RoundStats,
    RaffleNFTWinners,
    StakingNFTWinners,
    RaffleETHDeposits,
    AllPrizes,
    ...rest
  } = roundInfo;
  
  return {
    ...rest,
    // Preserve nested objects that components expect
    RoundStats: RoundStats || {},
    RaffleNFTWinners: RaffleNFTWinners || [],
    StakingNFTWinners: StakingNFTWinners || [],
    RaffleETHDeposits: RaffleETHDeposits || [],
    AllPrizes: AllPrizes || [],
    // Flatten ClaimPrizeTx.Tx fields
    EvtLogId: ClaimPrizeTx?.Tx?.EvtLogId,
    BlockNum: ClaimPrizeTx?.Tx?.BlockNum,
    TxId: ClaimPrizeTx?.Tx?.TxId,
    TxHash: ClaimPrizeTx?.Tx?.TxHash,
    TimeStamp: ClaimPrizeTx?.Tx?.TimeStamp,
    DateTime: ClaimPrizeTx?.Tx?.DateTime,
    // Flatten MainPrize fields
    WinnerAddr: MainPrize?.WinnerAddr || '',
    AmountEth: MainPrize?.EthAmountEth || 0,
    TokenId: MainPrize?.NftTokenId ?? -1,
    CSTAmountEth: MainPrize?.CstAmountEth || 0,
    // Flatten CharityDeposit fields
    CharityAddress: CharityDeposit?.CharityAddress || '',
    CharityAmountETH: CharityDeposit?.CharityAmountETH || 0,
    // Flatten StakingDeposit fields (match component's expected field names)
    StakingDepositAmountEth: StakingDeposit?.StakingDepositAmountEth || 0,
    StakingPerTokenEth: StakingDeposit?.StakingPerTokenEth || 0,
    StakingNumStakedTokens: StakingDeposit?.StakingNumStakedTokens || 0,
    // Flatten EnduranceChampion fields
    EnduranceWinnerAddr: EnduranceChampion?.WinnerAddr || '',
    EnduranceERC721TokenId: EnduranceChampion?.NftTokenId ?? -1,
    EnduranceERC20AmountEth: EnduranceChampion?.CstAmountEth || 0,
    // Flatten LastCstBidder fields
    LastCstBidderAddr: LastCstBidder?.WinnerAddr || '',
    LastCstBidderERC721TokenId: LastCstBidder?.NftTokenId ?? -1,
    LastCstBidderERC20AmountEth: LastCstBidder?.CstAmountEth || 0,
    // Flatten ChronoWarrior fields (match component's expected field names)
    ChronoWarriorAddr: ChronoWarrior?.WinnerAddr || '',
    ChronoWarriorAmountEth: ChronoWarrior?.EthAmountEth || 0,
    ChronoWarriorCstAmountEth: ChronoWarrior?.CstAmountEth || 0,
    ChronoWarriorNftTokenId: ChronoWarrior?.NftTokenId ?? -1,
  };
};

// Helper to normalize field names (TokenAddress -> TokenAddr for backward compatibility)
const normalizeFieldNames = (item: any) => {
  if (!item) return item;
  const normalized = { ...item };
  
  // Map TokenAddress to TokenAddr for components expecting the old field name
  if (normalized.TokenAddress !== undefined && normalized.TokenAddr === undefined) {
    normalized.TokenAddr = normalized.TokenAddress;
  }
  
  return normalized;
};

// Helper to normalize array of items
const normalizeFieldNamesArray = (items: any[]) => {
  if (!Array.isArray(items)) return items;
  return items.map(normalizeFieldNames);
};

class ApiService {
  public async create(token_id: number, count: number) {
    try {
      const { data } = await axios.post(getMainAPIUrl("cosmicgame_tokens"), {
        token_id,
        count,
      });
      return data?.task_id || -1;
    } catch (err) {
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  public async get_banned_bids() {
    try {
      const { data } = await axios.get(getMainAPIUrl("get_banned_bids"));
      return data;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  public async ban_bid(bid_id: number, user_addr: string) {
    try {
      const { data } = await axios.post(getMainAPIUrl("ban_bid"), {
        bid_id,
        user_addr,
      });
      return data;
    } catch (err) {
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  public async unban_bid(bid_id: number) {
    try {
      const { data } = await axios.post(getMainAPIUrl("unban_bid"), { bid_id });
      return data;
    } catch (err) {
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  public async get_info(token_id: number | string) {
    try {
      const { data } = await axios.get(getMainAPIUrl(`token_info/${token_id}`));
      return data.TokenInfo;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/statistics/dashboard",api_cosmic_game_dashboard)
  public async get_dashboard_info() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/dashboard"));
      return data;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/bidders",api_cosmic_game_user_unique_bidders)
  public async get_unique_bidders() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/bidders"));
      return data.UniqueBidders;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/winners",api_cosmic_game_user_unique_winners)
  public async get_unique_winners() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/winners"));
      return data.UniqueWinners;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/donors",api_cosmic_game_user_unique_donors)
  public async get_unique_donors() {
    try {
      const { data } = await axios.get(getAPIUrl("statistics/unique/donors"));
      return data.UniqueDonors;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/stakers/cst",api_cosmic_game_user_unique_stakers_cst)
  public async get_unique_cst_stakers() {
    try {
      const { data } = await axios.get(
        getAPIUrl("statistics/unique/stakers/cst")
      );
      return data.UniqueStakersCST;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/stakers/rwalk",api_cosmic_game_user_unique_stakers_rwalk)
  public async get_unique_rwalk_stakers() {
    try {
      const { data } = await axios.get(
        getAPIUrl("statistics/unique/stakers/rwalk")
      );
      return data.UniqueStakersRWalk;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/statistics/unique/stakers/both",api_cosmic_game_user_unique_stakers_both)
  public async get_unique_both_stakers() {
    try {
      const { data } = await axios.get(
        getAPIUrl("statistics/unique/stakers/both")
      );
      return data.UniqueStakersBoth;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/rounds/list/:offset/:limit",api_cosmic_game_prize_list)
  public async get_round_list() {
    try {
      const { data } = await axios.get(getAPIUrl("rounds/list/0/1000000"));
      // Each round has the same nested structure as RoundInfo, so flatten them all
      return (data.Rounds || []).map(flattenRoundInfo);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/rounds/info/:prize_num",api_cosmic_game_round_info)
  public async get_round_info(roundNum: number) {
    const id = roundNum < 0 ? 0 : roundNum;
    try {
      const { data } = await axios.get(getAPIUrl(`rounds/info/${id}`));
      return flattenRoundInfo(data.RoundInfo);
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/rounds/current/time",api_cosmic_game_prize_cur_round_time)
  public async get_prize_time() {
    try {
      const { data } = await axios.get(getAPIUrl("rounds/current/time"));
      return data.CurRoundPrizeTime;
    } catch (err) {
      if (err.response?.status === 400) {
        return 0;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/prizes/history/global/:offset/:limit",api_cosmic_game_global_claim_history_detail)
  public async get_claim_history() {
    try {
      const { data } = await axios.get(
        getAPIUrl("prizes/history/global/0/1000000")
      );
      return flattenTxArray(data.GlobalPrizeHistory);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/prizes/history/by_user/:user_addr/:offset/:limit",api_cosmic_game_prize_history_detail_by_user)
  public async get_claim_history_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`prizes/history/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.USerPrizeHistory);
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/prizes/deposits/raffle/by_user/:user_addr",api_cosmic_game_prize_deposits_raffle_eth_by_user)
  public async get_raffle_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`prizes/deposits/raffle/by_user/${address}`)
      );
      return flattenTxArray(data.UserRaffleDeposits);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/prizes/deposits/chrono_warrior/by_user/:user_addr",api_cosmic_game_prize_deposits_chrono_warrior_by_user)
  public async get_chrono_warrior_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`prizes/deposits/chrono_warrior/by_user/${address}`)
      );
      return flattenTxArray(data.UserChronoWarriorDeposits);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/prizes/deposits/unclaimed/by_user/:user_addr/:offset/:limit",api_cosmic_game_unclaimed_prize_deposits_by_user)
  public async get_unclaimed_raffle_deposits_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`prizes/deposits/unclaimed/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.UnclaimedDeposits);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/bid/list/all/:offset/:limit",api_cosmic_game_bid_list)
  public async get_bid_list() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/list/all/0/1000000"));
      return flattenTxArray(data.Bids);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/bid/info/:evtlog_id",api_cosmic_game_bid_info)
  public async get_bid_info(evtLogID: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`bid/info/${evtLogID}`));
      return flattenTx(data.BidInfo);
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/bid/list/by_round/:round_num/:sort/:offset/:limit",api_cosmic_game_bid_list_by_round)
  public async get_bid_list_by_round(round: number, sortDir: string) {
    try {
      const dir = sortDir === "asc" ? 0 : 1;
      const { data } = await axios.get(
        getAPIUrl(`bid/list/by_round/${round}/${dir}/0/1000000`)
      );
      return flattenTxArray(data.BidsByRound);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/bid/used_rwalk_nfts",api_cosmic_game_used_rwalk_nfts)
  public async get_used_rwlk_nfts() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/used_rwalk_nfts"));
      return data.UsedRwalkNFTs;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/bid/cst_price",api_cosmic_game_get_cst_price)
  public async get_ct_price() {
    try {
      const { data } = await axios.get(getAPIUrl("bid/cst_price"));
      return data;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/bid/current_special_winners",api_cosmic_game_bid_special_winners)
  public async get_current_special_winners() {
    try {
      const { data } = await axios.get(
        getAPIUrl("bid/current_special_winners")
      );
      return data;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/list/all/:offset/:limit",api_cosmic_game_cosmic_signature_token_list)
  public async get_cst_list() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/list/all/0/1000000"));
      return flattenTxArray(data.CosmicSignatureTokenList);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/list/by_user/:user_addr/:offset/:limit",api_cosmic_game_cosmic_signature_token_list_by_user)
  public async get_cst_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`cst/list/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.UserTokens);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/info/:token_id",api_cosmic_game_cosmic_signature_token_info)
  public async get_cst_info(tokenId: number) {
    try {
      const { data } = await axios.get(getAPIUrl(`cst/info/${tokenId}`));
      return flattenTx(data.TokenInfo);
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/names/history/:token_id",api_cosmic_game_token_name_history)
  public async get_name_history(token_id: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`cst/names/history/${token_id}`)
      );
      return flattenTxArray(data.TokenNameHistory);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/names/search/:name",api_cosmic_game_token_name_search)
  public async get_token_by_name(token_name: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`cst/names/search/${token_name}`)
      );
      return flattenTxArray(data.TokenNameSearchResults);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/names/named_only",api_cosmic_game_named_tokens_only)
  public async get_named_nfts() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/names/named_only"));
      return flattenTxArray(data.NamedTokens);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/transfers/by_user/:user_addr/:offset/:limit",api_cosmic_game_cosmic_signature_transfers_by_user)
  public async get_cst_transfers(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`cst/transfers/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.CosmicSignatureTransfers);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/distribution",api_cosmic_game_cs_token_distribution)
  public async get_cst_distribution() {
    try {
      const { data } = await axios.get(getAPIUrl("cst/distribution"));
      return data.CosmicSignatureTokenDistribution;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/ct/balances",api_cosmic_game_cosmic_token_balances)
  public async get_ct_balances_distribution() {
    try {
      const { data } = await axios.get(getAPIUrl("ct/balances"));
      return data.CosmicTokenBalances;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/ct/transfers/by_user/:user_addr/:offset/:limit",api_cosmic_game_cosmic_token_transfers_by_user)
  public async get_ct_transfers(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`ct/transfers/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.CosmicTokenTransfers);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/cst/transfers/all/:token_id/:offset/:limit",api_cosmic_game_token_ownership_transfers)
  public async get_ct_ownership_transfers(token_id: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`cst/transfers/all/${token_id}/0/1000000`)
      );
      return flattenTxArray(data.TokenTransfers);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/user/info/:user_addr",api_cosmic_game_user_info)
  public async get_user_info(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/info/${address}`));
      
      // Flatten nested Tx objects in all arrays within the user info response
      if (data) {
        return {
          ...data,
          Bids: flattenTxArray(data.Bids || []),
          PrizeHistory: flattenTxArray(data.PrizeHistory || []),
          CosmicSignatureTokensOwned: flattenTxArray(data.CosmicSignatureTokensOwned || []),
          CurrentlyStakedTokens: flattenTxArray(data.CurrentlyStakedTokens || []),
          DonatedNFTsClaimed: flattenTxArray(data.DonatedNFTsClaimed || []),
          DonatedTokensClaimed: flattenTxArray(data.DonatedTokensClaimed || []),
          ERC20Transfers: flattenTxArray(data.ERC20Transfers || []),
          ERC721Transfers: flattenTxArray(data.ERC721Transfers || []),
          ETHDonationsMade: flattenTxArray(data.ETHDonationsMade || []),
          MainPrizeClaims: flattenTxArray(data.MainPrizeClaims || []),
          MarketingRewardsAwarded: flattenTxArray(data.MarketingRewardsAwarded || []),
          StakingActions: flattenTxArray(data.StakingActions || []),
          TokenDonationsMade: flattenTxArray(data.TokenDonationsMade || []),
        };
      }
      
      return data;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/user/notif_red_box/:user_addr",api_cosmic_game_user_global_winnings)
  public async notify_red_box(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`user/notif_red_box/${address}`)
      );
      return data.Winnings;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/user/balances/:user_addr",api_cosmic_game_user_balances)
  public async get_user_balance(address: string) {
    try {
      const { data } = await axios.get(getAPIUrl(`user/balances/${address}`));
      return data;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/simple/list/:offset/:limit",api_cosmic_game_donations_cg_simple_list)
  public async get_donations_cg_simple_list() {
    try {
      const { data } = await axios.get(
        getAPIUrl("donations/eth/simple/list/0/1000000")
      );
      return flattenTxArray(data.DirectCGDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/simple/by_round/:round_num",api_cosmic_game_donations_cg_simple_by_round)
  public async get_donations_cg_simple_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/eth/simple/by_round/${round}`)
      );
      return flattenTxArray(data.DirectCGDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/with_info/list/:offset/:limit",api_cosmic_game_donations_cg_with_info_list)
  public async get_donations_cg_with_info_list() {
    try {
      const { data } = await axios.get(
        getAPIUrl("donations/eth/with_info/list/0/1000000")
      );
      return flattenTxArray(data.DirectCGDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/with_info/by_round/:round_num",api_cosmic_game_donations_cg_with_info_by_round)
  public async get_donations_cg_with_info_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/eth/with_info/by_round/${round}`)
      );
      return flattenTxArray(data.DirectCGDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/with_info/info/:record_id",api_cosmic_game_donations_cg_with_info_record_info)
  public async get_donations_with_info_by_id(id: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/eth/with_info/info/${id}`)
      );
      return flattenTx(data.ETHDonation);
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      return null;
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/by_user/:user_addr",api_cosmic_game_donations_by_user)
  public async get_donations_eth_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/eth/by_user/${address}`)
      );
      return flattenTxArray(data.CombinedDonationRecords);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/both/by_round/:round_num",api_cosmic_game_donations_cg_both_by_round)
  public async get_donations_both_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/eth/both/by_round/${round}`)
      );
      return flattenTxArray(data.CosmicGameDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/eth/both/all",api_cosmic_game_donations_cg_both_all)
  public async get_donations_both() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/eth/both/all"));
      return flattenTxArray(data.CosmicGameDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/deposits",api_cosmic_game_charity_donations_deposits)
  public async get_charity_donations_deposits() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/charity/deposits"));
      return flattenTxArray(data.CharityDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/cg_deposits",api_cosmic_game_charity_cosmicgame_deposits)
  public async get_charity_cg_deposits() {
    try {
      const { data } = await axios.get(
        getAPIUrl("donations/charity/cg_deposits")
      );
      return flattenTxArray(data.CharityDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/voluntary",api_cosmic_game_charity_voluntary_deposits)
  public async get_charity_voluntary() {
    try {
      const { data } = await axios.get(
        getAPIUrl("donations/charity/voluntary")
      );
      return flattenTxArray(data.CharityDonations);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/charity/withdrawals",api_cosmic_game_charity_donations_withdrawals)
  public async get_charity_withdrawals() {
    try {
      const { data } = await axios.get(
        getAPIUrl("donations/charity/withdrawals")
      );
      return flattenTxArray(data.CharityWithdrawals);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/list/:offset/:limit",api_cosmic_game_donations_nft_list)
  public async get_donations_nft_list() {
    try {
      const { data } = await axios.get(
        getAPIUrl("donations/nft/list/0/1000000")
      );
      return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/info/:record_id",api_cosmic_game_donated_nft_info)
  public async get_donated_nft_info(record_id: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/nft/info/${record_id}`)
      );
      return normalizeFieldNames(flattenTx(data.NFTDonation));
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/claims/:offset/:limit",api_cosmic_game_donated_nft_claims_all)
  public async get_donated_nft_claims_all() {
    try {
      const { data } = await axios.get(
        getAPIUrl("donations/nft/claims/0/100000")
      );
      return flattenTxArray(data.DonatedNFTClaims);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/claims/by_user/:user_addr",api_cosmic_game_donated_nft_claims_by_user)
  public async get_claimed_donated_nft_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/nft/claims/by_user/${address}`)
      );
      return flattenTxArray(data.DonatedNFTClaims);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/statistics",api_cosmic_game_nft_donation_stats)
  public async get_nft_donation_stats() {
    try {
      const { data } = await axios.get(getAPIUrl("donations/nft/statistics"));
      return data.NFTDonationStats;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/by_round/:prize_num",api_cosmic_game_nft_donations_by_prize)
  public async get_donations_nft_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/nft/by_round/${round}`)
      );
      return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/unclaimed/by_round/:prize_num",api_cosmic_game_unclaimed_donated_nfts_by_prize)
  public async get_donations_nft_unclaimed_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/nft/unclaimed/by_round/${round}`)
      );
      return normalizeFieldNamesArray(flattenTxArray(data.NFTDonations));
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/nft/unclaimed/by_user/:user_addr",api_cosmic_game_unclaimed_donated_nfts_by_user)
  public async get_unclaimed_donated_nft_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/nft/unclaimed/by_user/${address}`)
      );
      return normalizeFieldNamesArray(flattenTxArray(data.UnclaimedDonatedNFTs));
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/erc20/by_round/:round_num",api_cosmic_game_donations_erc20_by_round)
  public async get_donations_erc20_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/erc20/by_round/detailed/${round}`)
      );
      return normalizeFieldNamesArray(flattenTxArray(data.DonationsERC20ByRoundDetailed));
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/donations/erc20/by_user/:user_addr",api_cosmic_game_donations_erc20_by_user)
  public async get_donations_erc20_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`donations/erc20/by_user/${address}`)
      );
      return normalizeFieldNamesArray(flattenTxArray(data.DonatedPrizesERC20ByWinner));
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/raffle/deposits/list/:offset/:limit",api_cosmic_game_prize_deposits_list)
  public async get_prize_deposits_list() {
    try {
      const { data } = await axios.get(
        getAPIUrl("raffle/deposits/list/0/1000000")
      );
      return flattenTxArray(data.RaffleDeposits);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/raffle/deposits/by_round/:round_num",api_cosmic_game_prize_deposits_by_round)
  public async get_prize_deposits_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`raffle/deposits/by_round/${round}`)
      );
      return flattenTxArray(data.RaffleDeposits);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/raffle/nft/all/list/:offset/:limit",api_cosmic_game_raffle_nft_winners_list)
  public async get_raffle_nft_winners_list() {
    try {
      const { data } = await axios.get(
        getAPIUrl("raffle/nft/all/list/0/1000000")
      );
      return flattenTxArray(data.RaffleNFTWinners);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/raffle/nft/by_round/:round_num",api_cosmic_game_raffle_nft_winners_by_round)
  public async get_raffle_nft_winners_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`raffle/nft/by_round/${round}`)
      );
      return flattenTxArray(data.RaffleNFTWinners);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/raffle/nft/by_user/:user_addr",api_cosmic_game_user_raffle_nft_winnings)
  public async get_raffle_nft_winnings_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`raffle/nft/by_user/${address}`)
      );
      return flattenTxArray(data.UserRaffleNFTWinnings);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/to_claim/by_user/:user_addr",api_cosmic_game_staking_cst_rewards_to_claim_by_user)
  public async get_staking_cst_rewards_to_claim_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/rewards/to_claim/by_user/${address}`)
      );
      return flattenTxArray(data.UnclaimedEthDeposits);
    } catch (err) {
      console.log(err);
      if (err.response?.status === 400) {
        return [];
      }
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/collected/by_user/:user_addr/:offset/:limit",api_cosmic_game_staking_cst_rewards_collected_by_user)
  public async get_staking_cst_rewards_collected_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/rewards/collected/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.CollectedStakingCSTRewards);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/staked_tokens/by_user/:user_addr",api_cosmic_game_staked_tokens_cst_by_user)
  public async get_staked_cst_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/staked_tokens/by_user/${address}`)
      );
      return data.StakedTokensCST;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/action_ids_by_deposit/:user_addr/:deposit_id",api_cosmic_game_staking_cst_rewards_action_ids_by_deposit)
  public async get_cst_action_ids_by_deposit_id(
    user_addr: string,
    deposit_id: number
  ) {
    try {
      const { data } = await axios.get(
        getAPIUrl(
          `staking/cst/rewards/action_ids_by_deposit/${user_addr}/${deposit_id}`
        )
      );
      return data.ActionIdsWithClaimInfo;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/actions/by_user/:user_addr/:offset/:limit",api_cosmic_game_staking_cst_actions_by_user)
  public async get_staking_cst_actions_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/actions/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.StakingCSTActions);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/actions/global/:offset/:limit",api_cosmic_game_staking_actions_cst_global)
  public async get_staking_cst_actions() {
    try {
      const { data } = await axios.get(
        getAPIUrl("staking/cst/actions/global/0/1000000")
      );
      return flattenTxArray(data.StakingCSTActions);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/actions/info/:action_id",api_cosmic_game_staking_action_cst_info)
  public async get_staking_cst_actions_info(actionId: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/actions/info/${actionId}`)
      );
      return data.CombinedStakingRecordInfo;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/global",api_cosmic_game_staking_cst_rewards_global)
  public async get_staking_cst_rewards() {
    try {
      const { data } = await axios.get(getAPIUrl("staking/cst/rewards/global"));
      return flattenTxArray(data.StakingCSTRewards);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/by_round/:round_num",api_cosmic_game_staking_cst_rewards_by_round)
  public async get_staking_cst_rewards_by_round(round: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/rewards/by_round/${round}`)
      );
      return flattenTxArray(data.Rewards);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // TODO: check this api
  // r.GET("/api/cosmicgame/staking/cst/rewards/paid/by_user/:user_addr",api_cosmic_game_staking_cst_reward_paid_records_by_user)
  public async get_staking_cst_reward_paid_records_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/rewards/paid/by_user/${address}`)
      );
      return flattenTxArray(data.RewardPaidRecords);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/staked_tokens/all",api_cosmic_game_staked_tokens_cst_global)
  public async get_staked_cst_tokens() {
    try {
      const { data } = await axios.get(
        getAPIUrl("staking/cst/staked_tokens/all")
      );
      return data.StakedTokensCST;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/by_user/by_token/summary/:user_addr",api_cosmic_game_staking_cst_by_user_by_token_rewards)
  public async get_staking_rewards_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/rewards/by_user/by_token/summary/${address}`)
      );
      return data.RewardsByToken;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/cst/rewards/by_user/by_token/details/:user_addr/:token_id",api_cosmic_game_staking_cst_by_user_by_token_rewards_details)
  public async get_staking_rewards_by_user_by_token_details(
    address: string,
    tokenId: number
  ) {
    try {
      const { data } = await axios.get(
        getAPIUrl(
          `staking/cst/rewards/by_user/by_token/details/${address}/${tokenId}`
        )
      );
      const details = data.RewardsByTokenDetails;
      if (!details || typeof details !== 'object') return details;
      const result: any = {};
      Object.keys(details).forEach(key => {
        const item = details[key];
        if (!item) { result[key] = item; return; }
        const flattenStakeOrUnstake = (obj: any) => {
          if (!obj) return obj;
          if (obj.Tx && typeof obj.Tx === 'object') {
            const { Tx, ...rest } = obj;
            return { ...rest, EvtLogId: Tx.EvtLogId, BlockNum: Tx.BlockNum, TxId: Tx.TxId, TxHash: Tx.TxHash, TimeStamp: Tx.TimeStamp, DateTime: Tx.DateTime };
          }
          return obj;
        };
        result[key] = {
          ...item,
          Stake: flattenStakeOrUnstake(item.Stake),
          Unstake: flattenStakeOrUnstake(item.Unstake),
        };
      });
      return result;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // TODO: check this api
  // r.GET("/api/cosmicgame/staking/cst/rewards/by_user/by_deposit/:user_addr",api_cosmic_game_staking_cst_by_user_by_deposit_rewards)
  public async get_staking_cst_by_user_by_deposit_rewards(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/cst/rewards/by_user/by_deposit/${address}`)
      );
      return data.RewardsByDeposit;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/actions/info/:action_id",api_cosmic_game_staking_action_rwalk_info)
  public async get_staking_rwalk_actions_info(actionId: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/rwalk/actions/info/${actionId}`)
      );
      return data.CombinedRWalkStakingRecordInfo;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/actions/global/:offset/:limit",api_cosmic_game_staking_actions_rwalk_global)
  public async get_staking_rwalk_actions() {
    try {
      const { data } = await axios.get(
        getAPIUrl("staking/rwalk/actions/global/0/1000000")
      );
      return flattenTxArray(data.GlobalStakingActionsRWalk);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/actions/by_user/:user_addr/:offset/:limit",api_cosmic_game_staking_actions_rwalk_by_user)
  public async get_staking_rwalk_actions_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/rwalk/actions/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.UserStakingActionsRWalk);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/mints/global/:offset/:limit",api_cosmic_game_staking_rwalk_mints_global)
  public async get_staking_rwalk_mints_global() {
    try {
      const { data } = await axios.get(
        getAPIUrl("staking/rwalk/mints/global/0/1000000")
      );
      return flattenTxArray(data.StakingRWalkRewardsMints);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/mints/by_user/:user_addr",api_cosmic_game_staking_rwalk_mints_by_user)
  public async get_staking_rwalk_mints_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/rwalk/mints/by_user/${address}`)
      );
      return flattenTxArray(data.RWalkStakingRewardMints);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/staked_tokens/all",api_cosmic_game_staked_tokens_rwalk_global)
  public async get_staked_rwalk_tokens() {
    try {
      const { data } = await axios.get(
        getAPIUrl("staking/rwalk/staked_tokens/all")
      );
      return data.StakedTokensRWalk;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/staking/rwalk/staked_tokens/by_user/:user_addr",api_cosmic_game_staked_tokens_rwalk_by_user)
  public async get_staked_rwalk_tokens_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`staking/rwalk/staked_tokens/by_user/${address}`)
      );
      return data.StakedTokensRWalk;
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/marketing/rewards/global/:offset/:limit",api_cosmic_game_marketing_rewards_global)
  public async get_marketing_rewards() {
    try {
      const { data } = await axios.get(
        getAPIUrl("marketing/rewards/global/0/1000000")
      );
      return flattenTxArray(data.MarketingRewards);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/marketing/rewards/by_user/:user_addr/:offset/:limit",api_cosmic_game_marketing_rewards_by_user)
  public async get_marketing_rewards_by_user(address: string) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`marketing/rewards/by_user/${address}/0/1000000`)
      );
      return flattenTxArray(data.UserMarketingRewards);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/time/current",api_cosmic_game_time_current)
  public async get_current_time() {
    try {
      const { data } = await axios.get(getAPIUrl("time/current"));
      return data.CurrentTimeStamp;
    } catch (err) {
      if (err.response?.status === 400) {
        return 0;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/time/until_prize",api_cosmic_game_time_until_prize)
  public async get_time_until_prize() {
    try {
      const { data } = await axios.get(getAPIUrl("time/until_prize"));
      return data.TimeUntilPrize;
    } catch (err) {
      if (err.response?.status === 400) {
        return 0;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/system/modelist/:offset/:limit",api_cosmic_game_sysmode_changes)
  public async get_system_modelist() {
    try {
      const { data } = await axios.get(getAPIUrl("system/modelist/-1/1000000"));
      return flattenTxArray(data.SystemModeChanges);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  // r.GET("/api/cosmicgame/system/admin_events/:evtlog_start/:evtlog_end",api_cosmic_game_admin_events_in_range)
  public async get_system_events(start: number, end: number) {
    try {
      const { data } = await axios.get(
        getAPIUrl(`system/admin_events/${start}/${end}`)
      );
      return flattenTxArray(data.AdminEvents);
    } catch (err) {
      if (err.response?.status === 400) {
        return [];
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }

  public async get_bid_eth_price() {
    try {
      const { data } = await axios.get(getAPIUrl(`bid/eth_price`));
      return data;
    } catch (err) {
      if (err.response?.status === 400) {
        return null;
      }
      console.log(err);
      throw new Error("Network response was not OK");
    }
  }
}

export default new ApiService();
