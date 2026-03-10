import React, { useEffect, useState } from 'react';
import { Box, Link, Typography } from '@mui/material';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { MainWrapper } from '../../../components/styled';
import { getExplorerUrl, convertTimestampToDateTime, getMetadata } from '../../../utils';
import { createOpenGraphProps } from '../../../utils/seo';
import { useDonationsWithInfoById } from '../../../hooks/useApiQuery';

interface EthDonationDetailProps {
  id: number;
}

const EthDonationDetail = ({ id }: EthDonationDetailProps) => {
  const { data: rawDonationInfo, isLoading: loading } = useDonationsWithInfoById(id);
  const donationInfo =
    (rawDonationInfo as {
      TxHash: string;
      TimeStamp: number;
      DonorAddr: string;
      RoundNum: number;
      AmountEth: number;
      DataJson?: string;
      [key: string]: unknown;
    } | null) ?? null;

  const [dataJson, setDataJson] = useState<{
    title?: string;
    message?: string;
    url?: string;
  } | null>(null);
  const [metaData, setMetaData] = useState<{
    description?: string;
    Keywords?: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    if (!donationInfo) return;
    if (!donationInfo.DataJson) return;

    try {
      const jsonData = JSON.parse(String(donationInfo.DataJson));
      setDataJson(jsonData);
      getMetadata(jsonData.url).then(setMetaData);
    } catch {
      // JSON parse error – ignore
    }
  }, [donationInfo]);

  if (id < 0) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Donation Id</Typography>
      </MainWrapper>
    );
  }

  if (loading) {
    return (
      <MainWrapper>
        <Typography variant="h6">Loading...</Typography>
      </MainWrapper>
    );
  }

  if (!donationInfo) {
    return (
      <MainWrapper>
        <Typography variant="h6">Donation not found.</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center" mb={4}>
        Direct (ETH) Donation Detail
      </Typography>

      {/* Donation Date and Transaction Link */}
      <Box mb={1} display="flex" flexWrap="wrap">
        <Typography color="primary">Donate Datetime:</Typography>&nbsp;
        <Link href={getExplorerUrl('tx', donationInfo.TxHash)} target="_blank" color="inherit">
          <Typography>{convertTimestampToDateTime(donationInfo.TimeStamp)}</Typography>
        </Link>
      </Box>

      {/* Donor Address */}
      <Box mb={1} display="flex" flexWrap="wrap">
        <Typography color="primary">Donor Address:</Typography>&nbsp;
        <Link href={`/user/${donationInfo.DonorAddr}`} color="inherit">
          <Typography fontFamily="monospace">{donationInfo.DonorAddr}</Typography>
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
  context: GetServerSidePropsContext,
) => {
  const { id } = context.params!;
  const title = 'Direct (ETH) Donation Detail | Cosmic Signature';
  const description = 'Direct (ETH) Donation Detail';

  return { props: { ...createOpenGraphProps(title, description), id } };
};

export default EthDonationDetail;
