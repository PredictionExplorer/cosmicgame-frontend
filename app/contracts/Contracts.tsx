'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatEther } from 'viem';

import {
  charityWalletAbi as CHARITY_WALLET_ABI,
  cosmicGameAbi as COSMICGAME_ABI,
} from '@/contracts/abis';

import { networkConfig } from '@/config/networks';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { PageShell } from '@/components/ui/page-shell';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { reportError } from '@/utils/errors';
import { readCosmicGameWithFallback } from '@/utils/cosmicGameContractCompat';
import useContractNoSigner from '@/hooks/useContractNoSigner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';

import { NetworkBadge } from './components/NetworkBadge';
import { FundDistribution } from './components/FundDistribution';
import { GameConfiguration } from './components/GameConfiguration';
import { ContractAddressGrid } from './components/ContractAddressGrid';
import { AuctionParameters } from './components/AuctionParameters';
import { buildContracts } from './contractAddressData';

const sectionFade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const Contracts = () => {
  const { data, isLoading: loading } = useDashboardInfo();
  const { charity, cosmicGame } = useContractAddresses();

  const [searchTerm, setSearchTerm] = useState('');
  const [charityAddress, setCharityAddress] = useState('');
  const [priceIncrease, setPriceIncrease] = useState(0);
  const [timeIncrease, setTimeIncrease] = useState(0);
  const [timeIncrement, setTimeIncrement] = useState(0);
  const [initialIncrement, setInitialIncrement] = useState(0);
  const [msgMaxLen, setMsgMaxLen] = useState(0);
  const [cstRewardAmountForBidding, setCstRewardAmountForBidding] = useState(0);
  const [cstDutchAuctionDurations, setCstDutchAuctionDurations] = useState({
    AuctionDuration: 0,
    ElapsedDuration: 0,
  });
  const [ethDutchAuctionDurations, setEthDutchAuctionDurations] = useState({
    AuctionDuration: 0,
    ElapsedDuration: 0,
  });
  const [cstDutchAuctionBeginningBidPriceMinLimit, setCstDutchAuctionBeginningBidPriceMinLimit] =
    useState(0);

  const charityWalletContract = useContractNoSigner(charity, CHARITY_WALLET_ABI);
  const cosmicGameContract = useContractNoSigner(cosmicGame, COSMICGAME_ABI);

  useEffect(() => {
    if (!cosmicGameContract) return;

    const safeCall = async (fn: () => Promise<void>, name: string) => {
      try {
        await fn();
      } catch (e) {
        reportError(e, `contracts read ${name}`);
      }
    };

    safeCall(async () => {
      const v = await cosmicGameContract.read.bidMessageLengthMaxLimit?.();
      setMsgMaxLen(Number(v ?? 0));
    }, 'bidMessageLengthMaxLimit');

    safeCall(async () => {
      const v = await cosmicGameContract.read.ethBidPriceIncreaseDivisor?.();
      setPriceIncrease(100 / Number(v ?? 1));
    }, 'ethBidPriceIncreaseDivisor');

    safeCall(async () => {
      const v = await cosmicGameContract.read.mainPrizeTimeIncrementIncreaseDivisor?.();
      setTimeIncrease(100 / Number(v ?? 1));
    }, 'mainPrizeTimeIncrementIncreaseDivisor');

    safeCall(async () => {
      const v = await cosmicGameContract.read.mainPrizeTimeIncrementInMicroSeconds?.();
      setTimeIncrement(Number(v ?? 0) / 1_000_000);
    }, 'mainPrizeTimeIncrementInMicroSeconds');

    // Read the resolved initial duration (seconds) directly from the contract instead of the
    // legacy `InitialSecondsUntilPrize` API field, which actually carries the raw
    // `initialDurationUntilMainPrizeDivisor` and is not seconds.
    safeCall(async () => {
      const v = await cosmicGameContract.read.getInitialDurationUntilMainPrize?.();
      setInitialIncrement(Number(v ?? 0));
    }, 'getInitialDurationUntilMainPrize');

    safeCall(async () => {
      const v = await readCosmicGameWithFallback<bigint>([
        () => cosmicGameContract.read.cstRewardAmountForBidding?.() as Promise<bigint | undefined>,
        () => cosmicGameContract.read.bidCstRewardAmount?.() as Promise<bigint | undefined>,
        () => cosmicGameContract.read.getBidCstRewardAmount?.() as Promise<bigint | undefined>,
      ]);
      setCstRewardAmountForBidding(Number(formatEther(v ?? 0n)));
    }, 'cstRewardAmountForBidding');

    safeCall(async () => {
      const v = (await cosmicGameContract.read.getCstDutchAuctionDurations?.()) as
        | bigint[]
        | undefined;
      setCstDutchAuctionDurations({
        AuctionDuration: Number(v?.[0] ?? 0n),
        ElapsedDuration: Number(v?.[1] ?? 0n),
      });
    }, 'getCstDutchAuctionDurations');

    safeCall(async () => {
      const v = (await cosmicGameContract.read.getEthDutchAuctionDurations?.()) as
        | bigint[]
        | undefined;
      setEthDutchAuctionDurations({
        AuctionDuration: Number(v?.[0] ?? 0n),
        ElapsedDuration: Number(v?.[1] ?? 0n),
      });
    }, 'getEthDutchAuctionDurations');

    safeCall(async () => {
      const v = await cosmicGameContract.read.cstDutchAuctionBeginningBidPriceMinLimit?.();
      setCstDutchAuctionBeginningBidPriceMinLimit(Number(formatEther((v ?? 0n) as bigint)));
    }, 'cstDutchAuctionBeginningBidPriceMinLimit');
  }, [cosmicGameContract]);

  useEffect(() => {
    if (!charityWalletContract) return;
    const fetchData = async () => {
      try {
        const addr = (await charityWalletContract.read.charityAddress?.()) as string;
        setCharityAddress(addr);
      } catch (e) {
        reportError(e, 'fetch public goods beneficiary address');
      }
    };
    fetchData();
  }, [charityWalletContract]);

  const contracts = buildContracts(data?.ContractAddrs);

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        eyebrow={
          <SectionEyebrow tone="aurora" pulse>
            Verified Contracts · Arbitrum
          </SectionEyebrow>
        }
        title="Contract Addresses"
        titleLevel={2}
        gradientTitle="aurora"
        subtitle="On-chain addresses, configuration, source links, and verification context for the Cosmic Signature protocol."
      >
        <NetworkBadge chainName={networkConfig.chainName} chainId={networkConfig.chainId} />
      </PageHeader>

      <div className="space-y-10">
        <motion.section
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          aria-label="Allocation Tracks"
        >
          <FundDistribution
            prizePercentage={data?.PrizePercentage}
            chronoWarriorPercentage={data?.ChronoWarriorPercentage}
            stellarSelectionPercentage={data?.RafflePercentage}
            stakingPercentage={data?.StakingPercentage}
            charityPercentage={data?.CharityPercentage}
            loading={loading}
          />
        </motion.section>

        <motion.section
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          aria-label="Protocol Configuration"
        >
          <GameConfiguration
            priceIncrease={priceIncrease}
            timeIncrease={timeIncrease}
            timeIncrement={timeIncrement}
            cstRewardPerBid={cstRewardAmountForBidding}
            maxMessageLength={msgMaxLen}
            claimTimeout={data?.TimeoutClaimPrize ?? 0}
            initialIncrement={initialIncrement}
            loading={loading}
          />
        </motion.section>

        <motion.section
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          aria-label="Contract Addresses"
        >
          <SectionDivider title="Contract Addresses" className="mb-4" />
          <ContractAddressGrid
            contracts={contracts}
            explorerUrl={networkConfig.explorerUrl}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </motion.section>

        <motion.section
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.45 }}
          aria-label="Calibration Window and Stellar Selection Parameters"
        >
          <AuctionParameters
            cstDurations={cstDutchAuctionDurations}
            ethDurations={ethDutchAuctionDurations}
            cstBeginningBidPrice={cstDutchAuctionBeginningBidPriceMinLimit}
            publicGoodsVaultAddress={charity}
            charityAddress={charityAddress}
            charityVaultBalanceEth={Number(data?.CharityBalanceEth ?? 0)}
            charityPercentage={data?.CharityPercentage}
            explorerUrl={networkConfig.explorerUrl}
            raffleEthWinners={data?.NumRaffleEthWinnersBidding}
            raffleNftWinnersBidding={data?.NumRaffleNFTWinnersBidding}
            raffleNftWinnersStaking={data?.NumRaffleNFTWinnersStakingRWalk}
            loading={loading}
          />
        </motion.section>
      </div>
    </PageShell>
  );
};

export default Contracts;
