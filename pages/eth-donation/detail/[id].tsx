import React, { useEffect, useState } from "react";
import { Box, Link, Typography } from "@mui/material";
import { MainWrapper } from "../../../components/styled";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import {
  convertTimestampToDateTime,
  getMetadata,
  logoImgUrl,
} from "../../../utils";
import api from "../../../services/api";

interface EthDonationDetailProps {
  id: number;
}

const EthDonationDetail = ({ id }: EthDonationDetailProps) => {
  const [loading, setLoading] = useState(true);
  const [donationInfo, setDonationInfo] = useState<any>(null);
  const [dataJson, setDataJson] = useState<any>(null);
  const [metaData, setMetaData] = useState<any>(null);

  useEffect(() => {
    const fetchDonationDetail = async () => {
      setLoading(true);
      try {
        // Fetch donation detail by ID
        const info = await api.get_donations_with_info_by_id(id);
        setDonationInfo(info);

        if (info?.DataJson) {
          const jsonData = JSON.parse(info.DataJson);
          setDataJson(jsonData);

          // Fetch metadata from provided URL in the donation info
          const meta = await getMetadata(jsonData.url);
          setMetaData(meta);
        }
      } catch (error) {
        console.error("Failed to fetch donation details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetail();
  }, [id]);

  if (loading) {
    return (
      <MainWrapper>
        <Typography variant="h6">Loading...</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        Direct (ETH) Donation Detail
      </Typography>

      {/* Donation Date and Transaction Link */}
      <Box mb={1} display="flex" flexWrap="wrap">
        <Typography color="primary">Donate Datetime:</Typography>&nbsp;
        <Link
          href={`https://arbiscan.io/tx/${donationInfo.TxHash}`}
          target="_blank"
          color="inherit"
        >
          <Typography>
            {convertTimestampToDateTime(donationInfo.TimeStamp)}
          </Typography>
        </Link>
      </Box>

      {/* Donor Address */}
      <Box mb={1} display="flex" flexWrap="wrap">
        <Typography color="primary">Donor Address:</Typography>&nbsp;
        <Link href={`/user/${donationInfo.DonorAddr}`} color="inherit">
          <Typography fontFamily="monospace">
            {donationInfo.DonorAddr}
          </Typography>
        </Link>
      </Box>

      {/* Round Number */}
      <Box mb={1} display="flex" flexWrap="wrap">
        <Typography color="primary">Round Number:</Typography>&nbsp;
        <Link href={`/prize/${donationInfo.RoundNum}`} color="inherit">
          <Typography>{donationInfo.RoundNum}</Typography>
        </Link>
      </Box>

      {/* Donation Amount */}
      <Box mb={1} display="flex" flexWrap="wrap">
        <Typography color="primary">Amount:</Typography>&nbsp;
        <Typography>{donationInfo.AmountEth.toFixed(2)} ETH</Typography>
      </Box>

      {/* Additional JSON Data (if available) */}
      {dataJson && (
        <>
          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Title:</Typography>&nbsp;
            <Typography>{dataJson.title}</Typography>
          </Box>

          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">Message:</Typography>&nbsp;
            <Typography>{dataJson.message}</Typography>
          </Box>

          <Box mb={1} display="flex" flexWrap="wrap">
            <Typography color="primary">URL:</Typography>&nbsp;
            <Link href={dataJson.url} target="_blank" color="inherit">
              {dataJson.url}
            </Link>
          </Box>
        </>
      )}

      {/* Meta Data (if available) */}
      {metaData?.description && (
        <Box mb={1} display="flex" flexWrap="wrap">
          <Typography color="primary">Meta Description:</Typography>&nbsp;
          <Typography>{metaData.description}</Typography>
        </Box>
      )}

      {metaData?.Keywords && (
        <Box mb={1} display="flex" flexWrap="wrap">
          <Typography color="primary">Meta Keywords:</Typography>&nbsp;
          <Typography>{metaData.Keywords}</Typography>
        </Box>
      )}

      {metaData?.image && (
        <Box>
          <Typography color="primary" mb={1}>
            Meta Image:
          </Typography>
          <img src={metaData.image} width="100%" alt="Meta image" />
        </Box>
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id } = context.params!;
  const title = "Direct (ETH) Donation Detail | Cosmic Signature";
  const description = "Direct (ETH) Donation Detail";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData, id } };
};

export default EthDonationDetail;
