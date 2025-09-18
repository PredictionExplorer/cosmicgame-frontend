import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import { MainWrapper } from "../components/styled";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import api from "../services/api";
import { formatSeconds, logoImgUrl } from "../utils";
import { useNotification } from "../contexts/NotificationContext";
import useContractNoSigner from "../hooks/useContractNoSigner";
import CHARITY_WALLET_ABI from "../contracts/CharityWallet.json";
import COSMICGAME_ABI from "../contracts/CosmicGame.json";
import { CHARITY_WALLET_ADDRESS, COSMICGAME_ADDRESS } from "../config/app";
import { GetServerSideProps } from "next";
import { ethers } from "ethers";

/**
 * Defines the structure of props accepted by the ContractItem component.
 */
interface ContractItemProps {
  name: string; // Name/label of the item (e.g., "Cosmic Token Address")
  value: string | number | undefined;
  copyable?: boolean; // Whether the item is copyable to clipboard
}

/**
 * ContractItem: Renders a list item with an optional copy-to-clipboard functionality.
 */
const ContractItem = ({ name, value, copyable = false }: ContractItemProps) => {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const sm = useMediaQuery(theme.breakpoints.up("sm"));
  const { setNotification } = useNotification();

  return (
    <ListItem>
      {/* Render the "name" or label of the contract property */}
      <Typography
        color="primary"
        sx={{
          mr: 2,
          minWidth: md ? "350px" : "150px",
          maxWidth: md ? "350px" : "150px",
        }}
        variant={sm ? "subtitle1" : "body1"}
      >
        {name}:
      </Typography>

      {copyable ? (
        <CopyToClipboard text={value ? String(value) : ""}>
          <Box
            sx={{ display: "flex", cursor: "pointer", alignItems: "center" }}
            onClick={() =>
              setNotification({
                text: "Address copied!",
                type: "success",
                visible: true,
              })
            }
          >
            <Typography
              fontFamily="monospace"
              variant={sm ? "subtitle1" : "body1"}
              sx={{ wordBreak: "break-all", mr: 1 }}
            >
              {value}
            </Typography>
            <ContentCopyIcon fontSize="inherit" />
          </Box>
        </CopyToClipboard>
      ) : (
        <Typography
          fontFamily="monospace"
          variant={sm ? "subtitle1" : "body1"}
          sx={{ wordBreak: "break-all" }}
        >
          {value}
        </Typography>
      )}
    </ListItem>
  );
};

/**
 * Defines the structure of the data returned by the API (simplified for demonstration).
 * Adjust the interface as needed based on your actual API response.
 */
interface ContractAddresses {
  CosmicGameAddr: string;
  CosmicTokenAddr: string;
  CosmicSignatureAddr: string;
  RandomWalkAddr: string;
  CosmicDaoAddr: string;
  CharityWalletAddr: string;
  MarketingWalletAddr: string;
  PrizesWalletAddr: string;
  StakingWalletCSTAddr: string;
  StakingWalletRWalkAddr: string;
}

interface DashboardData {
  ContractAddrs: ContractAddresses;
  PrizePercentage: number;
  ChronoWarriorPercentage: number;
  RafflePercentage: number;
  StakignPercentage: number;
  NumRaffleEthWinnersBidding: number;
  NumRaffleNFTWinnersBidding: number;
  NumRaffleNFTWinnersStakingRWalk: number;
  CharityPercentage: number;
  RoundStartCSTAuctionLength: number;
  TimeoutClaimPrize: number;
  InitialSecondsUntilPrize: number;
}

/**
 * Contracts: Main component to display all contract-related information
 * and default settings fetched from the server and the CharityWallet contract.
 */
const Contracts = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [charityAddress, setCharityAddress] = useState("");
  const [priceIncrease, setPriceIncrease] = useState(0);
  const [timeIncrease, setTimeIncrease] = useState(0);
  const [msgMaxLen, setMsgMaxLen] = useState(0);
  const [cstRewardAmountForBidding, setCstRewardAmountForBidding] = useState(0);
  const [
    cstDutchAuctionBeginningBidPriceMinLimit,
    setCstDutchAuctionBeginningBidPriceMinLimit,
  ] = useState(0);

  // Use a read-only contract instance (without signer) for the Charity Wallet.
  const charityWalletContract = useContractNoSigner(
    CHARITY_WALLET_ADDRESS,
    CHARITY_WALLET_ABI
  );
  const cosmicGameContract = useContractNoSigner(
    COSMICGAME_ADDRESS,
    COSMICGAME_ABI
  );

  /**
   * Fetch initial dashboard data from the server via API.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const newData = await api.get_dashboard_info();
        setData(newData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMessageMaxLength = async () => {
      const maxLength = await cosmicGameContract.bidMessageLengthMaxLimit();
      setMsgMaxLen(maxLength);
    };
    const fetchPriceIncrease = async () => {
      const priceIncrease = await cosmicGameContract.ethBidPriceIncreaseDivisor();
      setPriceIncrease(100 / Number(priceIncrease));
    };
    const fetchTimeIncrease = async () => {
      const timeIncrease = await cosmicGameContract.mainPrizeTimeIncrementIncreaseDivisor();
      setTimeIncrease(100 / Number(timeIncrease));
    };
    const fetchCstRewardAmountForBidding = async () => {
      const cstRewardAmountForBidding = await cosmicGameContract.cstRewardAmountForBidding();
      setCstRewardAmountForBidding(
        Number(ethers.utils.formatEther(cstRewardAmountForBidding))
      );
    };
    const fetchCstDutchAuctionBeginningBidPriceMinLimit = async () => {
      const cstDutchAuctionBeginningBidPriceMinLimit = await cosmicGameContract.cstDutchAuctionBeginningBidPriceMinLimit();
      setCstDutchAuctionBeginningBidPriceMinLimit(
        Number(
          ethers.utils.formatEther(cstDutchAuctionBeginningBidPriceMinLimit)
        )
      );
    };

    if (cosmicGameContract) {
      try {
        fetchMessageMaxLength();
        fetchPriceIncrease();
        fetchTimeIncrease();
        fetchCstRewardAmountForBidding();
        fetchCstDutchAuctionBeginningBidPriceMinLimit();
      } catch (err) {
        console.error(err);
      }
    }
  }, [cosmicGameContract]);

  /**
   * If the CharityWallet contract is loaded, fetch the charity address on mount.
   */
  useEffect(() => {
    const fetchData = async () => {
      const addr = await charityWalletContract.charityAddress();
      setCharityAddress(addr);
    };

    if (charityWalletContract) {
      fetchData();
    }
  }, [charityWalletContract]);

  /**
   * Contract Items: List of essential contracts or metadata to display in the first List.
   */
  const contractItems = [
    { name: "Network", value: "Local Network" },
    { name: "Chain ID", value: 31337 },
    {
      name: "Cosmic Game Address",
      value: data?.ContractAddrs.CosmicGameAddr,
      copyable: true,
    },
    {
      name: "Cosmic Token Address",
      value: data?.ContractAddrs.CosmicTokenAddr,
      copyable: true,
    },
    {
      name: "Cosmic Signature Address",
      value: data?.ContractAddrs.CosmicSignatureAddr,
      copyable: true,
    },
    {
      name: "RandomWalk Address",
      value: data?.ContractAddrs.RandomWalkAddr,
      copyable: true,
    },
    {
      name: "Cosmic DAO Address",
      value: data?.ContractAddrs.CosmicDaoAddr,
      copyable: true,
    },
    {
      name: "Charity Wallet Address",
      value: data?.ContractAddrs.CharityWalletAddr,
      copyable: true,
    },
    {
      name: "Marketing Wallet Address",
      value: data?.ContractAddrs.MarketingWalletAddr,
      copyable: true,
    },
    {
      name: "Prizes Wallet Address",
      value: data?.ContractAddrs.PrizesWalletAddr,
      copyable: true,
    },
    {
      name: "Cosmic Signature Staking Wallet Address",
      value: data?.ContractAddrs.StakingWalletCSTAddr,
      copyable: true,
    },
    {
      name: "Random Walk Staking Wallet Address",
      value: data?.ContractAddrs.StakingWalletRWalkAddr,
      copyable: true,
    },
  ];

  /**
   * Configuration Items: List of additional contract configurations.
   */
  const configItems = [
    { name: "Price Increase", value: `${priceIncrease}%` },
    { name: "Time Increase", value: `${timeIncrease}%` },
    {
      name: "Prize Percentage",
      value: data ? `${data.PrizePercentage}%` : "--",
    },
    {
      name: "Chrono Warrior Percentage",
      value: data ? `${data.ChronoWarriorPercentage}%` : "--",
    },
    {
      name: "Raffle Percentage",
      value: data ? `${data.RafflePercentage}%` : "--",
    },
    {
      name: "Staking Percentage",
      value: data ? `${data.StakignPercentage}%` : "--",
    },
    {
      name: "Raffle ETH Winners for Bidding",
      value: data?.NumRaffleEthWinnersBidding,
    },
    {
      name: "Raffle NFT Winners for Bidding",
      value: data?.NumRaffleNFTWinnersBidding,
    },
    {
      name: "Raffle NFT Winners for Staking Random Walk",
      value: data?.NumRaffleNFTWinnersStakingRWalk,
    },
    {
      name: "Charity Address",
      value: charityAddress,
      copyable: true,
    },
    {
      name: "Charity Percentage",
      value: data ? `${data.CharityPercentage}%` : "--",
    },
    {
      name: "Amount of CosmicTokens earned per bid",
      value: `${Number(cstRewardAmountForBidding)} CST`,
    },
    {
      name: "Auction Duration",
      value: data ? formatSeconds(data.RoundStartCSTAuctionLength) : "--",
    },
    {
      name: "Timeout to claim prize",
      value: data ? formatSeconds(data.TimeoutClaimPrize) : "--",
    },
    { name: "Maximum message length", value: Number(msgMaxLen) },
    {
      name: "Initial increment first bid",
      value: data ? formatSeconds(data.InitialSecondsUntilPrize) : "--",
    },
    {
      name: "CST dutch auction beginning bid price",
      value: `${Number(cstDutchAuctionBeginningBidPriceMinLimit)} CST`,
    },
  ];

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" align="center">
        Contract Addresses
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          {/* List of essential contract addresses */}
          <List sx={{ mt: 4 }}>
            {contractItems.map(({ name, value, copyable }) => (
              <ContractItem
                key={name}
                name={name}
                value={value}
                copyable={copyable}
              />
            ))}
          </List>

          {/* List of additional contract configurations */}
          <Typography variant="h6" mt={5} mb={3}>
            Current configuration of the contracts
          </Typography>
          <List>
            {configItems.map(({ name, value, copyable }) => (
              <ContractItem
                key={name}
                name={name}
                value={value}
                copyable={copyable}
              />
            ))}
          </List>
        </>
      )}
    </MainWrapper>
  );
};

/**
 * getServerSideProps: Pre-renders the page with SEO data and social metadata.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Contracts | Cosmic Signature";
  const description =
    "Get detailed information on Cosmic Signature's smart contracts, including addresses, default initial values, and more.";

  // Open Graph and Twitter metadata
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

export default Contracts;
