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
import { useActiveWeb3React } from "../hooks/web3";
import { Network } from "@ethersproject/providers";

export const ContractListItem = styled(ListItem)({
  justifyContent: "center",
});

const ContractItem = ({ name, value }) => {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));
  const sm = useMediaQuery(theme.breakpoints.up("sm"));
  return (
    <ContractListItem>
      <Typography
        color="primary"
        sx={{ mr: 2, width: md ? "300px" : sm ? "150px" : "100px" }}
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
    </ContractListItem>
  );
};

const Contracts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState<Network>();
  const { library } = useActiveWeb3React();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const newData = await api.get_dashboard_info();
        setData(newData);
        const res = await library.getNetwork();
        setNetwork(res);
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
          <List sx={{ mt: 8 }}>
            <ContractItem name="Network" value={network?.name} />
            <ContractItem name="Chain ID" value={network?.chainId} />
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
              name="CharityWallet Address"
              value={data?.ContractAddrs.CharityWalletAddr}
            />
            <ContractItem
              name="RaffleWallet Address"
              value={data?.ContractAddrs.RaffleWalletAddr}
            />
          </List>
        )}
      </MainWrapper>
    </>
  );
};

export default Contracts;
