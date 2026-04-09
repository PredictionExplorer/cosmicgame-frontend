'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { getExplorerUrl, convertTimestampToDateTime, getMetadata } from '@/utils';

import { MainWrapper } from '@/components/styled';
import { useDonationsWithInfoById } from '@/hooks/useApiQuery';

interface EthDonationDetailPageProps {
  id: number;
}

const EthDonationDetailPage = ({ id }: EthDonationDetailPageProps) => {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDataJson(jsonData);
      getMetadata(jsonData.url).then(setMetaData);
    } catch {
      // JSON parse error - ignore
    }
  }, [donationInfo]);

  if (id < 0) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Invalid Donation Id</p>
      </MainWrapper>
    );
  }

  if (loading) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Loading...</p>
      </MainWrapper>
    );
  }

  if (!donationInfo) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Donation not found.</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <h2 className="text-2xl font-bold text-primary text-center mb-8">
        Direct (ETH) Donation Detail
      </h2>

      <div className="mb-2 flex flex-wrap">
        <span className="text-primary">Donate Datetime:</span>&nbsp;
        <a
          href={getExplorerUrl('tx', donationInfo.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit"
        >
          <span>{convertTimestampToDateTime(donationInfo.TimeStamp)}</span>
        </a>
      </div>

      <div className="mb-2 flex flex-wrap">
        <span className="text-primary">Donor Address:</span>&nbsp;
        <Link href={`/user/${donationInfo.DonorAddr}`} className="text-inherit">
          <span className="font-mono">{donationInfo.DonorAddr}</span>
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap">
        <span className="text-primary">Round Number:</span>&nbsp;
        <Link href={`/prize/${donationInfo.RoundNum}`} className="text-inherit">
          <span>{donationInfo.RoundNum}</span>
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap">
        <span className="text-primary">Amount:</span>&nbsp;
        <span>{donationInfo.AmountEth.toFixed(2)} ETH</span>
      </div>

      {dataJson && (
        <>
          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Title:</span>&nbsp;
            <span>{dataJson.title}</span>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">Message:</span>&nbsp;
            <span>{dataJson.message}</span>
          </div>

          <div className="mb-2 flex flex-wrap">
            <span className="text-primary">URL:</span>&nbsp;
            <a
              href={dataJson.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit"
            >
              {dataJson.url}
            </a>
          </div>
        </>
      )}

      {metaData?.description && (
        <div className="mb-2 flex flex-wrap">
          <span className="text-primary">Meta Description:</span>&nbsp;
          <span>{metaData.description}</span>
        </div>
      )}

      {metaData?.Keywords && (
        <div className="mb-2 flex flex-wrap">
          <span className="text-primary">Meta Keywords:</span>&nbsp;
          <span>{metaData.Keywords}</span>
        </div>
      )}

      {metaData?.image && (
        <div>
          <p className="text-primary mb-2">Meta Image:</p>
          <Image
            src={metaData.image}
            width={1200}
            height={675}
            alt="Meta image"
            style={{ width: '100%', height: 'auto' }}
            unoptimized
          />
        </div>
      )}
    </MainWrapper>
  );
};

export default EthDonationDetailPage;
