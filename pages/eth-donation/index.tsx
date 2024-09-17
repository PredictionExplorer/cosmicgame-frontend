import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import api from "../../services/api";
import EthDonationTable from "../../components/EthDonationTable";
import { GetServerSideProps } from "next";
import { useNotification } from "../../contexts/NotificationContext";
import { useActiveWeb3React } from "../../hooks/web3";
import useCosmicGameContract from "../../hooks/useCosmicGameContract";
import { ethers } from "ethers";

const EthDonations = () => {
  const [charityDonations, setCharityDonations] = useState(null);
  const [donateAmount, setDonateAmount] = useState("");
  const [donateInformation, setDonationInformation] = useState("");
  const { setNotification } = useNotification();
  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();

  const handleDonate = async () => {
    try {
      await cosmicGameContract.donate({
        value: ethers.utils.parseEther(donateAmount),
      });
      setNotification({
        text: `${donateAmount} ETH was donated successfully!`,
        type: "success",
        visible: true,
      });
      setDonateAmount("");
      setTimeout(() => {
        fetchCharityDonations();
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDonateWithInfo = async () => {
    try {
      await cosmicGameContract.donateWithInfo(donateInformation, {
        value: ethers.utils.parseEther(donateAmount),
      });
      setNotification({
        text: `${donateAmount} ETH was donated with information successfully!`,
        type: "success",
        visible: true,
      });
      setDonateAmount("");
      setDonationInformation("");
      setTimeout(() => {
        fetchCharityDonations();
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchCharityDonations = async () => {
    const donation = await api.get_donations_both();
    setCharityDonations(donation);
  };

  useEffect(() => {
    fetchCharityDonations();
  }, []);

  return (
    <MainWrapper>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        Direct (ETH) Donations
      </Typography>

      {!!account && (
        <>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography mr={1}>Amount: </Typography>
              <TextField
                placeholder="Donation amount"
                type="number"
                value={donateAmount}
                size="small"
                sx={{ mr: 1 }}
                onChange={(e) => setDonateAmount(e.target.value)}
              />
              <Typography>ETH</Typography>
            </Box>
            <TextField
              value={donateInformation}
              multiline
              rows={5}
              fullWidth
              placeholder="Please input the donation information in JSON format."
              onChange={(e) => setDonationInformation(e.target.value)}
            />
          </Box>
          <Box mt={1} mb={1}>
            <Button
              variant="contained"
              disabled={donateAmount === "0" || donateAmount === ""}
              onClick={handleDonate}
              sx={{ mr: 1 }}
            >
              Donate
            </Button>
            <Button
              variant="contained"
              onClick={handleDonateWithInfo}
              disabled={donateAmount === "0" || donateAmount === ""}
            >
              Donate with info
            </Button>
          </Box>
        </>
      )}
      {charityDonations === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          <Typography variant="h6">History</Typography>
          <EthDonationTable list={charityDonations} />
        </>
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Direct (ETH) Donations | Cosmic Signature";
  const description = "Direct (ETH) Donations";
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default EthDonations;
