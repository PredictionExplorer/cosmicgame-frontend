import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import api from "../services/api";
import useStakingWalletCSTContract from "../hooks/useStakingWalletCSTContract";
import useStakingWalletRWLKContract from "../hooks/useStakingWalletRWLKContract";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import { formatSeconds } from "../utils";
import { useNotification } from "../contexts/NotificationContext";

const ContractItem = ({ name, value, copyable = false }) => {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const sm = useMediaQuery(theme.breakpoints.up("sm"));
  const { setNotification } = useNotification();

  return (
    <>
      <ListItem>
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
          <CopyToClipboard text={value}>
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
    </>
  );
};

const Contracts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minStakeCSTPeriod, setMinStakeCSTPeriod] = useState(0);
  const [minStakeRWalkPeriod, setMinStakeRWalkPeriod] = useState(0);
  const [timeoutClaimPrize, setTimeoutClaimPrize] = useState(0);
  const [initialSecondsUntilPrize, setInitialSecondsUntilPrize] = useState(0);
  const [auctionLength, setAuctionLength] = useState(0);
  const stakingWalletCSTContract = useStakingWalletCSTContract();
  const stakingWalletRWalkContract = useStakingWalletRWLKContract();
  const cosmicGameContract = useCosmicGameContract();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const newData = await api.get_dashboard_info();
        setData(newData);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let minStakePeriod = await stakingWalletCSTContract.minStakePeriod();
      setMinStakeCSTPeriod(Number(minStakePeriod));
      minStakePeriod = await stakingWalletRWalkContract.minStakePeriod();
      setMinStakeRWalkPeriod(Number(minStakePeriod));
      const timeout = await cosmicGameContract.timeoutClaimPrize();
      setTimeoutClaimPrize(Number(timeout));
      const initialSeconds = await cosmicGameContract.initialSecondsUntilPrize();
      setInitialSecondsUntilPrize(Number(initialSeconds));
      const auctionLength = await cosmicGameContract.RoundStartCSTAuctionLength();
      setAuctionLength(Number(auctionLength));
    };
    if (
      stakingWalletCSTContract &&
      stakingWalletRWalkContract &&
      cosmicGameContract
    ) {
      fetchData();
    }
  }, [
    stakingWalletCSTContract,
    stakingWalletRWalkContract,
    cosmicGameContract,
  ]);

  return (
    <>
      <Head>
        <title>Contracts | CosmicSignature NFT</title>
        <meta
          name="description"
          content="Programmatically generated CosmicSignature image and video NFTs. ETH spent on minting goes back to the minters."
        />
      </Head>
      <MainWrapper>
        <Typography variant="h4" color="primary" align="center">
          Contract Addresses
        </Typography>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <List sx={{ mt: 4 }}>
              <ContractItem name="Network" value="Local Network" />
              <ContractItem name="Chain ID" value={31337} />
              <ContractItem
                name="Cosmic Game Address"
                value={data?.ContractAddrs.CosmicGameAddr}
                copyable={true}
              />
              <ContractItem
                name="Cosmic Token Address"
                value={data?.ContractAddrs.CosmicTokenAddr}
                copyable={true}
              />
              <ContractItem
                name="Cosmic Signature Address"
                value={data?.ContractAddrs.CosmicSignatureAddr}
                copyable={true}
              />
              <ContractItem
                name="Business Logic Address"
                value={data?.ContractAddrs.BusinessLogicAddr}
                copyable={true}
              />
              <ContractItem
                name="Cosmic DAO Address"
                value={data?.ContractAddrs.CosmicDaoAddr}
                copyable={true}
              />
              <ContractItem
                name="Charity Wallet Address"
                value={data?.ContractAddrs.CharityWalletAddr}
                copyable={true}
              />
              <ContractItem
                name="Marketing Wallet Address"
                value={data?.ContractAddrs.MarketingWalletAddr}
                copyable={true}
              />
              <ContractItem
                name="Raffle Wallet Address"
                value={data?.ContractAddrs.RaffleWalletAddr}
                copyable={true}
              />
              <ContractItem
                name="Cosmic Signature Staking Wallet Address"
                value={data?.ContractAddrs.StakingWalletCSTAddr}
                copyable={true}
              />
              <ContractItem
                name="Random Walk Staking Wallet Address"
                value={data?.ContractAddrs.StakingWalletRWalkAddr}
                copyable={true}
              />
            </List>
            <Typography variant="h6" mt={5} mb={3}>
              Current configuration of the contracts
            </Typography>
            <List>
              <ContractItem name="Price Increase" value="1%" />
              <ContractItem name="Time Increase" value="0.01%" />
              <ContractItem
                name="Prize Percentage"
                value={`${data.PrizePercentage}%`}
              />
              <ContractItem
                name="Raffle Percentage"
                value={`${data.RafflePercentage}%`}
              />
              <ContractItem
                name="Staking Percentage"
                value={`${data.StakignPercentage}%`}
              />
              <ContractItem
                name="Raffle ETH Winners for Bidding"
                value={data.NumRaffleEthWinnersBidding}
              />
              <ContractItem
                name="Raffle NFT Winners for Bidding"
                value={data.NumRaffleNFTWinnersBidding}
              />
              <ContractItem
                name="Raffle NFT Winners for Staking CST"
                value={data.NumRaffleNFTWinnersStakingCST}
              />
              <ContractItem
                name="Raffle NFT Winners for Staking Random Walk"
                value={data.NumRaffleNFTWinnersStakingRWalk}
              />
              <ContractItem
                name="Charity Address"
                value={data.CharityAddr}
                copyable={true}
              />
              <ContractItem
                name="Charity Percentage"
                value={`${data.CharityPercentage}%`}
              />

              <ContractItem
                name="Amount of CosmicTokens earned per bid"
                value={100}
              />
              <ContractItem
                name="Auction Duration"
                value={formatSeconds(auctionLength)}
              />
              <ContractItem
                name="Timeout to claim prize"
                value={formatSeconds(timeoutClaimPrize)}
              />
              <ContractItem name="Maximum message length" value={280} />
              <ContractItem
                name="Initial increment first bid"
                value={formatSeconds(initialSecondsUntilPrize)}
              />
              <ContractItem
                name="Random Walk contract address"
                value={data?.ContractAddrs.RandomWalkAddr}
                copyable={true}
              />
            </List>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default Contracts;
