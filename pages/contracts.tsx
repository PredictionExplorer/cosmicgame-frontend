import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";

const ContractItem = ({ name, value }) => {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const sm = useMediaQuery(theme.breakpoints.up("sm"));
  return (
    <ListItem>
      <Typography
        color="primary"
        sx={{ mr: 2, width: md ? "350px" : sm ? "150px" : "100px" }}
        variant={sm ? "subtitle1" : "body1"}
      >
        {name}:
      </Typography>
      <Typography
        fontFamily="monospace"
        variant={sm ? "subtitle1" : "body1"}
        sx={{ width: "42ch" }}
      >
        {value}
      </Typography>
    </ListItem>
  );
};

const Contracts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <Head>
        <title>Withdraw | CosmicSignature NFT</title>
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
              <ContractItem name="Network" value="Arbitrum Sepolia" />
              <ContractItem name="Chain ID" value={421614} />
              <ContractItem
                name="Business Logic Address"
                value={data?.ContractAddrs.BusinessLogicAddr}
              />
              <ContractItem
                name="CosmicGame Address"
                value={data?.ContractAddrs.CosmicGameAddr}
              />
              <ContractItem
                name="CosmicToken Address"
                value={data?.ContractAddrs.CosmicTokenAddr}
              />
              <ContractItem
                name="CosmicSignature Address"
                value={data?.ContractAddrs.CosmicSignatureAddr}
              />
              <ContractItem
                name="CosmicDAO Address"
                value={data?.ContractAddrs.CosmicDaoAddr}
              />
              <ContractItem
                name="Charity Wallet Address"
                value={data?.ContractAddrs.CharityWalletAddr}
              />
              <ContractItem
                name="Marketing Wallet Address"
                value={data?.ContractAddrs.MarketingWalletAddr}
              />
              <ContractItem
                name="Raffle Wallet Address"
                value={data?.ContractAddrs.RaffleWalletAddr}
              />
              <ContractItem
                name="Staking Wallet Address"
                value={data?.ContractAddrs.StakingWalletAddr}
              />
            </List>
            <Typography variant="h6" mt={5} mb={3}>
              Current configuration of the contracts.
            </Typography>
            <List>
              <ContractItem name="Price Increase" value="1%" />
              <ContractItem name="Time Increase" value="0.01%" />
              <ContractItem
                name="Prize Percentage"
                value={`${data.PrizePercentage} %`}
              />
              <ContractItem
                name="Raffle Percentage"
                value={`${data.RafflePercentage} %`}
              />
              <ContractItem
                name="NFT Holder Winners"
                value={data.NumHolderNFTWinners}
              />
              <ContractItem
                name="Raffle ETH Winners"
                value={data.NumRaffleEthWinners}
              />
              <ContractItem
                name="Raffle NFT Winners"
                value={data.NumRaffleNFTWinners}
              />
              <ContractItem
                name="Raffle Holder NFT Winners"
                value={data.NumHolderNFTWinners}
              />
              <ContractItem name="Charity Address" value={data.CharityAddr} />
              <ContractItem
                name="Charity Percentage"
                value={`${data.CharityPercentage} %`}
              />

              <ContractItem
                name="Amount of CosmicTokens earned per bid"
                value={100}
              />
              <ContractItem name="Timeout to claim prize" value="1 Day" />
              <ContractItem name="Maximum message length" value={280} />
              <ContractItem name="Initial increment first bid" value="1 Day" />
              <ContractItem
                name="Random Walk contract address"
                value={data?.ContractAddrs.RandomWalkAddr}
              />
            </List>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default Contracts;
