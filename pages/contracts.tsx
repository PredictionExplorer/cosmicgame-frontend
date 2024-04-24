import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  useTheme,
  useMediaQuery,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import api from "../services/api";

const ContractItem = ({ name, value, copyable = false }) => {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const sm = useMediaQuery(theme.breakpoints.up("sm"));
  const [notification, setNotification] = useState(false);
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        open={notification}
        onClose={() => setNotification(false)}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotification(false)}
        >
          Address copied!
        </Alert>
      </Snackbar>
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
              onClick={() => setNotification(true)}
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
                name="Business Logic Address"
                value={data?.ContractAddrs.BusinessLogicAddr}
                copyable={true}
              />
              <ContractItem
                name="CosmicGame Address"
                value={data?.ContractAddrs.CosmicGameAddr}
                copyable={true}
              />
              <ContractItem
                name="CosmicToken Address"
                value={data?.ContractAddrs.CosmicTokenAddr}
                copyable={true}
              />
              <ContractItem
                name="CosmicSignature Address"
                value={data?.ContractAddrs.CosmicSignatureAddr}
                copyable={true}
              />
              <ContractItem
                name="CosmicDAO Address"
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
                name="Staking Wallet Address"
                value={data?.ContractAddrs.StakingWalletAddr}
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
              <ContractItem name="Timeout to claim prize" value="1 Day" />
              <ContractItem name="Maximum message length" value={280} />
              <ContractItem name="Initial increment first bid" value="1 Day" />
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
