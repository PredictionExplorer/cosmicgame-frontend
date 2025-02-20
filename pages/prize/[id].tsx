import React, { useEffect, useState, useMemo } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";

import api from "../../services/api";
import useCosmicGameContract from "../../hooks/useCosmicGameContract";
import { useApiData } from "../../contexts/ApiDataContext";
import { useNotification } from "../../contexts/NotificationContext";

import {
  convertTimestampToDateTime,
  getEnduranceChampions,
  logoImgUrl,
} from "../../utils";
import getErrorMessage from "../../utils/alert";

// Child Components
import RaffleWinnerTable from "../../components/RaffleWinnerTable";
import BiddingHistoryTable from "../../components/BiddingHistoryTable";
import StakingWinnerTable from "../../components/StakingWinnerTable";
import DonatedNFTTable from "../../components/DonatedNFTTable";
import EnduranceChampionsTable from "../../components/EnduranceChampionsTable";

/* ------------------------------------------------------------------
  Helper Sub-Component: InfoRow
  Displays a single label-value pair (optionally linked)
------------------------------------------------------------------ */
interface InfoRowProps {
  label: string;
  value: string | number;
  link?: string;
  monospace?: boolean;
}
const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  link,
  monospace = false,
}) => {
  return (
    <Box mb={1}>
      <Typography color="primary" component="span">
        {label}
      </Typography>
      &nbsp;
      {link ? (
        <Typography component="span">
          <Link
            href={link}
            color="inherit"
            fontSize="inherit"
            target={link.startsWith("http") ? "__blank" : undefined}
            sx={monospace ? { fontFamily: "monospace" } : {}}
          >
            {value}
          </Link>
        </Typography>
      ) : (
        <Typography
          component="span"
          fontFamily={monospace ? "monospace" : "inherit"}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: PrizeDetails
  Renders the main "prize info" rows using `InfoRow`.
------------------------------------------------------------------ */
interface PrizeDetailsProps {
  prizeInfo: any; // shape from your API, e.g. RoundInfo
  stakingRewards: any[];
}
const PrizeDetails: React.FC<PrizeDetailsProps> = ({
  prizeInfo,
  stakingRewards,
}) => {
  return (
    <>
      <InfoRow
        label="Datetime:"
        value={convertTimestampToDateTime(prizeInfo.TimeStamp)}
        link={`https://arbiscan.io/tx/${prizeInfo.TxHash}`}
      />
      <InfoRow
        label="Prize Amount:"
        value={`${prizeInfo.AmountEth.toFixed(4)} ETH`}
      />
      <InfoRow
        label="Prize Token ID:"
        value={prizeInfo.TokenId}
        link={`/detail/${prizeInfo.TokenId}`}
      />
      <InfoRow
        label="Winner Address:"
        value={prizeInfo.WinnerAddr}
        link={`/user/${prizeInfo.WinnerAddr}`}
        monospace
      />
      <InfoRow
        label="Charity Address:"
        value={prizeInfo.CharityAddress}
        monospace
      />
      <InfoRow
        label="Charity Amount:"
        value={`${prizeInfo.CharityAmountETH.toFixed(4)} ETH`}
      />
      <InfoRow
        label="Endurance Champion Prize Winner Address:"
        value={prizeInfo.EnduranceWinnerAddr}
        link={`/user/${prizeInfo.EnduranceWinnerAddr}`}
      />
      <InfoRow
        label="Endurance Champion rewarded with CST NFT Token ID:"
        value={prizeInfo.EnduranceERC721TokenId}
        link={`/detail/${prizeInfo.EnduranceERC721TokenId}`}
      />
      <InfoRow
        label="Endurance Champion rewarded with CST (ERC20):"
        value={`${prizeInfo.EnduranceERC20AmountEth} CST`}
      />

      {prizeInfo.StellarWinnerAddr && (
        <>
          <InfoRow
            label="Stellar Spender Prize Winner Address:"
            value={prizeInfo.StellarWinnerAddr}
            link={`/user/${prizeInfo.StellarWinnerAddr}`}
          />
          <InfoRow
            label="Stellar Spender rewarded with CST NFT Token ID:"
            value={prizeInfo.StellarERC721TokenId}
            link={`/detail/${prizeInfo.StellarERC721TokenId}`}
          />
          <InfoRow
            label="Stellar Spender rewarded with CST (ERC20):"
            value={`${prizeInfo.StellarERC20AmountEth.toFixed(2)} CST`}
          />
        </>
      )}

      <InfoRow label="Total Bids:" value={prizeInfo.RoundStats.TotalBids} />
      <InfoRow
        label="Total Donated NFTs:"
        value={prizeInfo.RoundStats.TotalDonatedNFTs}
      />
      <InfoRow
        label="Total Raffle Eth Deposits:"
        value={`${prizeInfo.RoundStats.TotalRaffleEthDepositsEth.toFixed(
          4
        )} ETH`}
      />
      <InfoRow
        label="Total Raffle NFTs:"
        value={prizeInfo.RoundStats.TotalRaffleNFTs}
      />
      <InfoRow
        label="Total Staking Deposit Amount:"
        value={`${prizeInfo.StakingDepositAmountEth.toFixed(4)} ETH`}
      />
      <InfoRow
        label="Number of Staked Tokens:"
        value={prizeInfo.StakingNumStakedTokens}
      />
      <InfoRow label="Number of Stakers:" value={stakingRewards.length} />
    </>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: BiddingHistorySection
  Renders the "Bid History" portion
------------------------------------------------------------------ */
interface BiddingHistorySectionProps {
  bidHistory: any[];
}
const BiddingHistorySection: React.FC<BiddingHistorySectionProps> = ({
  bidHistory,
}) => (
  <Box mt={4}>
    <Typography variant="h6" lineHeight={1}>
      Bid History
    </Typography>
    <BiddingHistoryTable biddingHistory={bidHistory} />
  </Box>
);

/* ------------------------------------------------------------------
  Sub-Component: EnduranceChampionsSection
  Renders the "Endurance Champions" portion
------------------------------------------------------------------ */
interface EnduranceChampionsSectionProps {
  championList: any[];
}
const EnduranceChampionsSection: React.FC<EnduranceChampionsSectionProps> = ({
  championList,
}) => (
  <Box mt={4}>
    <Typography variant="h6">Endurance Champions</Typography>
    <EnduranceChampionsTable championList={championList} />
  </Box>
);

/* ------------------------------------------------------------------
  Sub-Component: RaffleWinnersSection
  Renders the "Raffle Winners" portion
------------------------------------------------------------------ */
interface RaffleWinnersSectionProps {
  RaffleETHDeposits: any[];
  RaffleNFTWinners: any[];
}
const RaffleWinnersSection: React.FC<RaffleWinnersSectionProps> = ({
  RaffleETHDeposits,
  RaffleNFTWinners,
}) => (
  <Box mt={4}>
    <Typography variant="h6" mb={2}>
      Raffle Winners
    </Typography>
    <RaffleWinnerTable
      RaffleETHDeposits={RaffleETHDeposits}
      RaffleNFTWinners={RaffleNFTWinners}
    />
  </Box>
);

/* ------------------------------------------------------------------
  Sub-Component: StakingRewardsSection
  Renders the "Staking Rewards" portion
------------------------------------------------------------------ */
interface StakingRewardsSectionProps {
  stakingRewards: any[];
}
const StakingRewardsSection: React.FC<StakingRewardsSectionProps> = ({
  stakingRewards,
}) => (
  <Box mt={4}>
    <Typography variant="h6" mb={2}>
      Staking Rewards
    </Typography>
    <StakingWinnerTable list={stakingRewards} />
  </Box>
);

/* ------------------------------------------------------------------
  Sub-Component: DonatedNFTsSection
  Renders the "Donated NFTs" portion, including "Claim All" button
------------------------------------------------------------------ */
interface DonatedNFTsSectionProps {
  roundNum: number;
  nftDonations: any[];
  donatedNFTToClaim: any[];
  handleAllDonatedNFTsClaim: () => Promise<void>;
  isClaiming: boolean;
}
const DonatedNFTsSection: React.FC<DonatedNFTsSectionProps> = ({
  roundNum,
  nftDonations,
  donatedNFTToClaim,
  handleAllDonatedNFTsClaim,
  isClaiming,
}) => {
  return (
    <Box mt={8}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Donated NFTs</Typography>
        {donatedNFTToClaim.length > 0 && (
          <Button
            variant="contained"
            onClick={handleAllDonatedNFTsClaim}
            disabled={isClaiming}
          >
            Claim All
          </Button>
        )}
      </Box>
      <DonatedNFTTable
        list={nftDonations}
        handleClaim={null}
        claimingTokens={[]}
      />
    </Box>
  );
};

/* ------------------------------------------------------------------
  Main Component: PrizeInfo
------------------------------------------------------------------ */
interface PrizeInfoProps {
  roundNum: number;
}
const PrizeInfo: React.FC<PrizeInfoProps> = ({ roundNum }) => {
  const cosmicGameContract = useCosmicGameContract();
  const { apiData: status } = useApiData();
  const { setNotification } = useNotification();

  const [donatedNFTToClaim, setDonatedNFTToClaim] = useState<any[]>([]);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [nftDonations, setNftDonations] = useState<any[]>([]);
  const [prizeInfo, setPrizeInfo] = useState<any>(null);
  const [stakingRewards, setStakingRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  /* ------------------------------------------------------------------
    Data Fetching
  ------------------------------------------------------------------ */

  // Fetch unclaimed donated NFTs
  const fetchUnclaimedDonatedNFTs = async () => {
    try {
      const nfts = await api.get_donations_nft_unclaimed_by_round(roundNum);
      setDonatedNFTToClaim(nfts);
    } catch (error) {
      console.error("Error fetching unclaimed donated NFTs:", error);
      setNotification({
        text: "Failed to load unclaimed donated NFTs.",
        type: "error",
        visible: true,
      });
    }
  };

  // "Claim All" Donated NFTs
  const handleAllDonatedNFTsClaim = async () => {
    setIsClaiming(true);
    try {
      const indexList = donatedNFTToClaim.map((item) => item.Index);
      await cosmicGameContract.claimManyDonatedNFTs(indexList);
      await fetchUnclaimedDonatedNFTs();
    } catch (err) {
      const errorMsg = getErrorMessage(
        err?.data?.message || err.message || "An error occurred"
      );
      setNotification({ text: errorMsg, type: "error", visible: true });
      console.error("Error claiming donated NFTs:", err);
    } finally {
      setIsClaiming(false);
    }
  };

  // Re-fetch unclaimed NFTs if the global status changes
  useEffect(() => {
    if (typeof status?.NumDonatedNFTToClaim === "number") {
      fetchUnclaimedDonatedNFTs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.NumDonatedNFTToClaim, roundNum]);

  // Fetch main data for the selected round
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          nftDonationsData,
          prizeInfoData,
          bidHistoryData,
          stakingRewardsData,
        ] = await Promise.all([
          api.get_donations_nft_by_round(roundNum),
          api.get_round_info(roundNum),
          api.get_bid_list_by_round(roundNum, "desc"),
          api.get_staking_cst_rewards_by_round(roundNum),
        ]);

        setNftDonations(nftDonationsData);
        setPrizeInfo(prizeInfoData);
        setBidHistory(bidHistoryData);
        setStakingRewards(stakingRewardsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotification({
          text: "Failed to load data. Please try again later.",
          type: "error",
          visible: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roundNum, setNotification]);

  // Compute the champion list using memo
  const championList = useMemo(() => {
    if (bidHistory.length > 0 && prizeInfo) {
      const champions = getEnduranceChampions(bidHistory, prizeInfo.TimeStamp);
      return champions.sort((a, b) => b.chronoWarrior - a.chronoWarrior);
    }
    return [];
  }, [bidHistory, prizeInfo]);

  /* ------------------------------------------------------------------
    Render
  ------------------------------------------------------------------ */

  if (loading) {
    return (
      <MainWrapper>
        <Typography variant="h6">Loading...</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Box mb={4}>
        <Typography variant="h4" color="primary" component="span" mr={2}>
          {`Round #${roundNum}`}
        </Typography>
        <Typography variant="h4" component="span">
          Prize Information
        </Typography>
      </Box>

      {!prizeInfo ? (
        <Typography>Prize data not found!</Typography>
      ) : (
        <Box>
          {/* Prize Details */}
          <PrizeDetails prizeInfo={prizeInfo} stakingRewards={stakingRewards} />

          {/* Bid History */}
          <BiddingHistorySection bidHistory={bidHistory} />

          {/* Endurance Champions */}
          <EnduranceChampionsSection championList={championList} />

          {/* Raffle Winners */}
          <RaffleWinnersSection
            RaffleETHDeposits={prizeInfo.RaffleETHDeposits}
            RaffleNFTWinners={prizeInfo.RaffleNFTWinners}
          />

          {/* Staking Rewards */}
          <StakingRewardsSection stakingRewards={stakingRewards} />

          {/* Donated NFTs */}
          <DonatedNFTsSection
            roundNum={roundNum}
            nftDonations={nftDonations}
            donatedNFTToClaim={donatedNFTToClaim}
            handleAllDonatedNFTsClaim={handleAllDonatedNFTsClaim}
            isClaiming={isClaiming}
          />
        </Box>
      )}
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps for SEO and default export
------------------------------------------------------------------ */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id as string | string[];
  const roundNum = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
  const title = `Prize Information for Round ${roundNum} | Cosmic Signature`;
  const description = `Prize Information for Round ${roundNum}`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return {
    props: { title, description, openGraphData, roundNum },
  };
}

export default PrizeInfo;
