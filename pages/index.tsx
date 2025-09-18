import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Link,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { MainWrapper } from "../components/styled";
import BiddingHistory from "../components/BiddingHistoryTable";
import api, { cosmicGameBaseUrl } from "../services/api";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import { BigNumber, ethers } from "ethers";
import useRWLKNFTContract from "../hooks/useRWLKNFTContract";
import { useActiveWeb3React } from "../hooks/web3";
import { ART_BLOCKS_ADDRESS } from "../config/app";
import Prize from "../components/Prize";
import LatestNFTs from "../components/LatestNFTs";
import DonatedNFT from "../components/DonatedNFT";
import {
  calculateTimeDiff,
  getAssetsUrl,
  getEnduranceChampions,
  logoImgUrl,
} from "../utils";
import WinningHistoryTable from "../components/WinningHistoryTable";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import { useRouter } from "next/router";
import { CustomPagination } from "../components/CustomPagination";
import RaffleHolderTable from "../components/RaffleHolderTable";
import { GetServerSideProps } from "next";
import TwitterPopup from "../components/TwitterPopup";
import TwitterShareButton from "../components/TwitterShareButton";
import ETHSpentTable from "../components/ETHSpentTable";
import EnduranceChampionsTable from "../components/EnduranceChampionsTable";
import EthDonationTable from "../components/EthDonationTable";
import axios from "axios";
import DonatedERC20Table from "../components/DonatedERC20Table";
import ChartOrPie from "../components/ChartOrPie";
import BiddingSection from "../components/BiddingSection";

const NewHome = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });
  const [curBidList, setCurBidList] = useState([]);
  const [specialWinners, setSpecialWinners] = useState<any>(null);
  const [winProbability, setWinProbability] = useState<any>(null);
  const [ethBidInfo, setEthBidInfo] = useState<any>(null);
  const [donatedNFTs, setDonatedNFTs] = useState([]);
  const [ethDonations, setEthDonations] = useState([]);
  const [championList, setChampionList] = useState<any>(null);
  const [prizeTime, setPrizeTime] = useState(0);
  const [timeoutClaimPrize, setTimeoutClaimPrize] = useState(0);
  const [message, setMessage] = useState("");
  const [nftDonateAddress, setNftDonateAddress] = useState("");
  const [nftId, setNftId] = useState("");
  const [rwlkId, setRwlkId] = useState(-1);
  const [bannerToken, setBannerToken] = useState({ seed: "", id: -1 });
  const [rwlknftIds, setRwlknftIds] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);
  const [roundStarted, setRoundStarted] = useState("");
  const [lastBidderElapsed, setLastBidderElapsed] = useState("");
  const [curPage, setCurrentPage] = useState(1);
  const [claimHistory, setClaimHistory] = useState(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [twitterPopupOpen, setTwitterPopupOpen] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [activationTime, setActivationTime] = useState(0);
  const [donatedTokensTab, setDonatedTokensTab] = useState(0);
  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState([]);
  const perPage = 12;

  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const nftRWLKContract = useRWLKNFTContract();

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  const gridLayout =
    donatedNFTs.length > 16
      ? { xs: 6, sm: 3, md: 2, lg: 2 }
      : donatedNFTs.length > 9
      ? { xs: 6, sm: 4, md: 3, lg: 3 }
      : { xs: 12, sm: 6, md: 4, lg: 4 };

  const handleTabChange = (_event: any, newValue: number) => {
    setDonatedTokensTab(newValue);
  };

  const playAudio = async () => {
    try {
      const audioElement = new Audio("/audio/notification.wav");
      await audioElement.play();
    } catch (error) {
      console.error("Error requesting sound permission:", error);
    }
  };

  const getRwlkNFTIds = async () => {
    try {
      if (nftRWLKContract && account) {
        const used_rwalk = await api.get_used_rwlk_nfts();
        const biddedRWLKIds = used_rwalk.map((x: any) => x.RWalkTokenId);
        const tokens = await nftRWLKContract.walletOfOwner(account);
        const nftIds = tokens
          .map((t: BigNumber) => t.toNumber())
          .filter((t: number) => !biddedRWLKIds.includes(t))
          .reverse();
        setRwlknftIds(nftIds);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchData = async () => {
    try {
      const newData = await api.get_dashboard_info();
      if (newData) {
        const round = newData.CurRoundNum;
        const [
          newBidData,
          nftData,
          championsData,
          specials,
          ethDonations,
          donatedERC20Tokens,
        ] = await Promise.all([
          api.get_bid_list_by_round(round, "desc"),
          api.get_donations_nft_by_round(round),
          (async () => {
            const bids = await api.get_bid_list_by_round(round, "desc");
            const champions = getEnduranceChampions(bids);
            const sortedChampions = [...champions].sort(
              (a, b) => b.chronoWarrior - a.chronoWarrior
            );
            return sortedChampions;
          })(),
          api.get_current_special_winners(),
          api.get_donations_cg_with_info_by_round(round),
          api.get_donations_erc20_by_round(round),
        ]);
        setCurBidList(newBidData);
        setDonatedNFTs(nftData);
        setChampionList(championsData);
        setSpecialWinners(specials);
        setEthDonations(ethDonations);
        setDonatedERC20Tokens(donatedERC20Tokens);
      }
      setData((prevData: any) => {
        if (
          account !== newData?.LastBidderAddr &&
          prevData &&
          prevData.CurNumBids < newData?.CurNumBids
        ) {
          playAudio();
        }
        return newData;
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchPrizeTime = async () => {
    try {
      const t = await api.get_prize_time();
      const current = await api.get_current_time();
      const diff = current * 1000 - Date.now();
      setPrizeTime(t * 1000 - diff);
    } catch (err) {
      console.error("Error fetching prize time:", err);
    }
  };

  const fetchClaimHistory = async () => {
    try {
      const history = await api.get_claim_history();
      setClaimHistory(history);
    } catch (err) {
      console.error("Error fetching claim history:", err);
    }
  };

  const fetchCSTBidData = async () => {
    try {
      let ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration),
          CSTPrice: parseFloat(ethers.utils.formatEther(ctData.CSTPrice)),
          SecondsElapsed: parseInt(ctData.SecondsElapsed),
        });
      }
    } catch (err) {
      console.error("Error fetching CST bid data:", err);
    }
  };

  const fetchEthBidInfo = async () => {
    const ethBidInfo = await api.get_bid_eth_price();
    setEthBidInfo({
      AuctionDuration: parseInt(ethBidInfo.AuctionDuration),
      ETHPrice: parseFloat(ethers.utils.formatEther(ethBidInfo.ETHPrice)),
      SecondsElapsed: parseInt(ethBidInfo.SecondsElapsed),
    });
  };

  const fetchDataCollection = async () => {
    await Promise.all([
      getRwlkNFTIds(),
      fetchData(),
      // fetchPrizeTime(),
      fetchClaimHistory(),
      fetchCSTBidData(),
      fetchEthBidInfo(),
    ]);
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }
  };

  const sendNotification = (title: string, options: any) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (prizeTime && now >= prizeTime - 5 * 60 * 1000 && now <= prizeTime) {
        sendNotification("Bid Now or Miss Out!", {
          body:
            "Time is running out! You have 5 minutes to place your bids and win amazing prizes.",
        });
        clearInterval(interval); // Stop the interval once the notification is sent
      }
      if (now > prizeTime) {
        clearInterval(interval);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [prizeTime]);

  useEffect(() => {
    if (nftRWLKContract && account) {
      getRwlkNFTIds();
    }
  }, [nftRWLKContract, account]);

  useEffect(() => {
    requestNotificationPermission();
    if (router.query) {
      if (router.query.randomwalk) {
        setRwlkId(Number(router.query.tokenId));
        setBidType("RandomWalk");
      }
      if (router.query.donation) {
        setNftDonateAddress(ART_BLOCKS_ADDRESS);
        const tokenId = Array.isArray(router.query.tokenId)
          ? router.query.tokenId[0]
          : router.query.tokenId;
        setNftId(tokenId);
        setBidType("ETH");
        setAdvancedExpanded(true);
      }
      if (router.query.referred_by) {
        setTwitterPopupOpen(true);
      }
    }

    const calculateTimeOffset = async () => {
      const current = await api.get_current_time();
      const offset = current * 1000 - Date.now();
      setOffset(offset);
    };

    calculateTimeOffset();
    fetchDataCollection();
    fetchEthBidInfo();

    // Fetch data every 12 seconds
    const interval = setInterval(fetchDataCollection, 12000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (twitterHandle) {
      setMessage(`@${twitterHandle} referred by @${router.query.referred_by}.`);
    }
  }, [twitterHandle]);

  useEffect(() => {
    const probabilityOfSelection = (
      totalBids: number,
      chosenBids: number,
      yourBids: number
    ) => {
      const probability =
        1 - Math.pow((totalBids - yourBids) / totalBids, chosenBids);
      return probability;
    };

    const calculateProbability = async () => {
      const userInfo = await api.get_user_info(account);
      const Bids = userInfo?.Bids || [];
      if (Bids.length) {
        const curRoundBids = Bids.filter(
          (bid: any) => bid.RoundNum === data.CurRoundNum
        );
        const raffle =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleEthWinnersBidding,
            curRoundBids.length
          ) * 100;
        const nft =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleNFTWinnersBidding,
            curRoundBids.length
          ) * 100;
        setWinProbability({
          raffle: raffle,
          nft: nft,
        });
      }
    };
    if (data && account && curBidList.length) {
      calculateProbability();
    }
  }, [data, account, curBidList]);

  useEffect(() => {
    const fetchCSTInfo = async (bannerId: number) => {
      const res = await api.get_cst_info(bannerId);
      const fileName = `0x${res.Seed}`;
      setBannerToken({ seed: fileName, id: bannerId });
    };
    if (data && bannerToken.seed === "") {
      if (data?.MainStats.NumCSTokenMints > 0) {
        let bannerId = Math.floor(
          Math.random() * data?.MainStats.NumCSTokenMints
        );
        fetchCSTInfo(bannerId);
      } else if (data?.MainStats.NumCSTokenMints === 0) {
        setBannerToken({ seed: "sample", id: -1 });
      }
    }

    const interval = setInterval(async () => {
      await fetchPrizeTime();
      setRoundStarted(calculateTimeDiff(data?.TsRoundStart - offset / 1000));
      if (curBidList.length) {
        const lastBidTime = curBidList[0].TimeStamp;
        setLastBidderElapsed(calculateTimeDiff(lastBidTime - offset / 1000));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, offset, curBidList, bannerToken.seed]);

  const fetchActivationTime = async () => {
    const activationTime = await cosmicGameContract.roundActivationTime();
    setActivationTime(Number(activationTime - offset / 1000));
  };

  useEffect(() => {
    const fetchTimeoutClaimPrize = async () => {
      const timeout = await cosmicGameContract.timeoutDurationToClaimMainPrize();
      setTimeoutClaimPrize(Number(timeout));
    };

    if (cosmicGameContract) {
      fetchTimeoutClaimPrize();
      fetchActivationTime();
    }
  }, [cosmicGameContract, offset]);

  return (
    <>
      <MainWrapper>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <BiddingSection
          data={data}
          loading={loading}
          onRefresh={fetchDataCollection}
        />

        <Box>
          <Typography variant="body2" mt={4}>
            When you bid, you will get 100 Cosmic Tokens as a reward. These
            tokens allow you to participate in the DAO.
          </Typography>
          <Box mt={2}>
            <Typography variant="body2" color="primary" component="span">
              *
            </Typography>
            <Typography variant="body2" component="span">
              When you bid, you are also buying a raffle ticket.{" "}
              {data?.NumRaffleEthWinnersBidding} raffle tickets will be chosen
              and these people will win {data?.RafflePercentage}% of the pot.
              Also, {data?.NumRaffleNFTWinnersBidding} additional winners and{" "}
              {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk NFT stakers{" "}
              will be chosen which will receive a Cosmic Signature NFT.
            </Typography>
          </Box>
          <Typography variant="body2" mt={2}>
            When this round ends, Ethereum Protocol Guild (
            <Link
              href="https://protocol-guild.readthedocs.io"
              target="_blank"
              sx={{ color: "inherit" }}
            >
              https://protocol-guild.readthedocs.io
            </Link>
            ) will receive 10% of the prize pool (at least{" "}
            {(data?.CosmicGameBalanceEth / 10).toFixed(4)} ETH).
          </Typography>
        </Box>
        <Box mt={6}>
          <Typography variant="subtitle1" color="primary" textAlign="center">
            Distribution of funds on each round
          </Typography>
          <ChartOrPie data={data} />
        </Box>

        {data && <Prize data={data} />}

        <Box mt={10}>
          <Typography variant="h6">TOP RAFFLE TICKETS HOLDERS</Typography>
          <RaffleHolderTable
            list={curBidList}
            numRaffleEthWinner={data?.NumRaffleEthWinnersBidding}
            numRaffleNFTWinner={data?.NumRaffleNFTWinnersBidding}
          />
        </Box>
        <Box mt={10}>
          <Typography variant="h6">TOP ETH SPENDERS FOR BID</Typography>
          <ETHSpentTable list={curBidList} />
        </Box>
        <Box mt={10}>
          <Typography variant="h6">
            ENDURANCE CHAMPIONS FOR CURRENT ROUND
          </Typography>
          <EnduranceChampionsTable championList={championList} />
        </Box>
        {ethDonations.length > 0 && (
          <Box mt={10}>
            <Typography variant="h6">
              ETH DONATIONS FOR CURRENT ROUND
            </Typography>
            <EthDonationTable list={ethDonations} showType={false} />
          </Box>
        )}
        <Box marginTop={10}>
          <Typography variant="h6">DONATED TOKENS FOR CURRENT ROUND</Typography>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="fullWidth"
              value={donatedTokensTab}
              onChange={handleTabChange}
            >
              <Tab label="ERC721 Tokens" />
              <Tab label="ERC20 Tokens" />
            </Tabs>
          </Box>
          <CustomTabPanel value={donatedTokensTab} index={0}>
            {donatedNFTs.length > 0 ? (
              <>
                <Grid container spacing={2} mt={2}>
                  {donatedNFTs.map((nft) => (
                    <Grid
                      item
                      key={nft.RecordId}
                      xs={gridLayout.xs}
                      sm={gridLayout.sm}
                      md={gridLayout.md}
                      lg={gridLayout.lg}
                    >
                      <DonatedNFT nft={nft} />
                    </Grid>
                  ))}
                </Grid>
                <CustomPagination
                  page={curPage}
                  setPage={setCurrentPage}
                  totalLength={donatedNFTs.length}
                  perPage={perPage}
                />
              </>
            ) : (
              <Typography>
                No ERC721 tokens were donated on this round.
              </Typography>
            )}
          </CustomTabPanel>
          <CustomTabPanel value={donatedTokensTab} index={1}>
            <DonatedERC20Table list={donatedERC20Tokens} handleClaim={null} />
          </CustomTabPanel>
        </Box>
        <Box mt={10}>
          <Box>
            <Typography variant="h6" component="span">
              CURRENT ROUND BID HISTORY
            </Typography>
            <Typography
              variant="h6"
              component="span"
              color="primary"
              sx={{ ml: 1 }}
            >
              (ROUND {data?.CurRoundNum})
            </Typography>
          </Box>
          <BiddingHistory biddingHistory={curBidList} showRound={false} />
        </Box>
      </MainWrapper>

      <LatestNFTs />

      <Container>
        <Box margin="100px 0">
          <Typography variant="h4" textAlign="center" mb={6}>
            History of Winnings
          </Typography>
          {claimHistory === null ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <WinningHistoryTable winningHistory={claimHistory} />
          )}
        </Box>
        <Box margin="100px 0">
          <Typography variant="h4" textAlign="center" mb={6}>
            Create a Twitter Post and Refer People
          </Typography>
          <TwitterShareButton />
        </Box>
      </Container>
      {imageOpen && (
        <Lightbox
          image={
            bannerToken.seed === ""
              ? "/images/qmark.png"
              : getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`)
          }
          title="This is a possible image of the NFT you are going to receive."
          onClose={() => setImageOpen(false)}
        />
      )}
      <TwitterPopup
        open={twitterPopupOpen}
        setOpen={setTwitterPopupOpen}
        setTwitterHandle={setTwitterHandle}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Cosmic Signature";
  const { data } = await axios.get(cosmicGameBaseUrl + "statistics/dashboard");
  const description = `Cosmic Signature is a strategy bidding game. In an exhilarating contest, players will bid against other players and against time to win exciting ${data?.PrizeAmountEth.toFixed(
    4
  )}ETH prizes and Cosmic Signature NFTs.`;

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default NewHome;
