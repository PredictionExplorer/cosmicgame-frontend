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
import { logoImgUrl } from "../../utils";

const EthDonations = () => {
  // State for donation data, amount, and donation information (JSON format)
  const [charityDonations, setCharityDonations] = useState(null);
  const [donateAmount, setDonateAmount] = useState("");
  const [donateInformation, setDonationInformation] = useState("");

  const { setNotification } = useNotification();
  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();

  // Fetches the donation history
  const fetchCharityDonations = async () => {
    const donations = await api.get_donations_both();
    setCharityDonations(donations);
  };

  useEffect(() => {
    fetchCharityDonations();
  }, []);

  // Handles basic ETH donation
  const handleDonate = async () => {
    try {
      await cosmicGameContract.donateEth({
        value: ethers.utils.parseEther(donateAmount),
      });

      setNotification({
        text: `${donateAmount} ETH was donated successfully!`,
        type: "success",
        visible: true,
      });

      setDonateAmount("");

      // Refresh donations after 1 second
      setTimeout(fetchCharityDonations, 1000);
    } catch (error) {
      if (error?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error("Donation error:", error);
        setNotification({
          text: "Donation failed, please try again.",
          type: "error",
          visible: true,
        });
      }
    }
  };

  // Handles ETH donation with additional JSON information
  const handleDonateWithInfo = async () => {
    try {
      await cosmicGameContract.donateEthWithInfo(donateInformation, {
        value: ethers.utils.parseEther(donateAmount),
      });

      setNotification({
        text: `${donateAmount} ETH with information was donated successfully!`,
        type: "success",
        visible: true,
      });

      setDonateAmount("");
      setDonationInformation("");

      // Refresh donations after 1 second
      setTimeout(fetchCharityDonations, 1000);
    } catch (error) {
      if (error?.code === 4001) {
        console.log("User denied transaction signature.");
        // Handle the case where the user denies the transaction signature
      } else {
        console.error("Donation with info error:", error);
        setNotification({
          text: "Donation with information failed, please check your input.",
          type: "error",
          visible: true,
        });
      }
    }
  };

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

      {charityDonations === null ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          <Typography variant="h6">Donation History</Typography>
          <EthDonationTable list={charityDonations} />
        </>
      )}

      {!!account && (
        <>
          <Box mt={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography mr={1}>Amount:</Typography>
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
              placeholder="Donation information (JSON format)"
              onChange={(e) => setDonationInformation(e.target.value)}
            />
          </Box>

          <Box mt={1} mb={1}>
            <Button
              variant="contained"
              disabled={!donateAmount || donateAmount === "0"}
              onClick={handleDonate}
              sx={{ mr: 1 }}
            >
              Donate
            </Button>
            <Button
              variant="contained"
              disabled={!donateAmount || donateAmount === "0"}
              onClick={handleDonateWithInfo}
            >
              Donate with Info
            </Button>
          </Box>
        </>
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Direct (ETH) Donations | Cosmic Signature";
  const description = "Direct (ETH) Donations";

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

export default EthDonations;
