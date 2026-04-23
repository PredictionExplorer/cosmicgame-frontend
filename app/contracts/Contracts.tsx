'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatEther } from 'viem';

import {
  charityWalletAbi as CHARITY_WALLET_ABI,
  cosmicGameAbi as COSMICGAME_ABI,
} from '@/contracts/abis';

import { networkConfig, CHARITY_WALLET_ADDRESS, COSMICGAME_ADDRESS } from '@/config/networks';
import { MainWrapper } from '@/components/styled';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { reportError } from '@/utils/errors';
import useContractNoSigner from '@/hooks/useContractNoSigner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';

import { NetworkBadge } from './components/NetworkBadge';
import { FundDistribution } from './components/FundDistribution';
import { GameConfiguration } from './components/GameConfiguration';
import { ContractAddressGrid, type ContractEntry } from './components/ContractAddressGrid';
import { AuctionParameters } from './components/AuctionParameters';

const sectionFade = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

function buildContracts(addrs: Record<string, string | undefined> | undefined): ContractEntry[] {
  if (!addrs) return [];
  return [
    {
      name: 'Cosmic Signature (core)',
      address: addrs.CosmicGameAddr ?? '',
      description: 'Core protocol contract: cycles, gestures, and settlement (on-chain name: CosmicGame)',
      category: 'core',
    },
    {
      name: 'Cosmic Signature Token',
      address: addrs.CosmicTokenAddr ?? '',
      description: 'ERC-20 coordination token (CST) imprinted per gesture and used in on-chain coordination',
      category: 'core',
    },
    {
      name: 'Cosmic Signature',
      address: addrs.CosmicSignatureAddr ?? '',
      description: 'ERC-721 collection minted as part of allocation tracks',
      category: 'core',
    },
    {
      name: 'RandomWalk',
      address: addrs.RandomWalkAddr ?? '',
      description: 'Random Walk NFT collection; can be anchored for Stellar Selection eligibility',
      category: 'core',
    },
    {
      name: 'Cosmic Council',
      address: addrs.CosmicDaoAddr ?? '',
      description: 'On-chain coordination (governor) for protocol parameters',
      category: 'core',
    },
    {
      name: 'Public Goods Vault',
      address: addrs.CharityWalletAddr ?? '',
      description: 'Forwards the public-goods share each cycle (on-chain: CharityWallet)',
      category: 'wallet',
    },
    {
      name: 'Outreach Reserve',
      address: addrs.MarketingWalletAddr ?? '',
      description: 'Outreach and ecosystem-growth allocations',
      category: 'wallet',
    },
    {
      name: 'Allocations Wallet',
      address: addrs.PrizesWalletAddr ?? '',
      description: 'Escrow for retrievable ETH and attached tokens (on-chain: PrizesWallet)',
      category: 'wallet',
    },
    {
      name: 'CST Anchor Wallet',
      address: addrs.StakingWalletCSTAddr ?? '',
      description: 'Anchoring contract for Cosmic Signature NFTs',
      category: 'staking',
    },
    {
      name: 'Random Walk Anchor Wallet',
      address: addrs.StakingWalletRWalkAddr ?? '',
      description: 'Anchoring contract for Random Walk NFTs',
      category: 'staking',
    },
  ].filter((c) => c.address) as ContractEntry[];
}

const Contracts = () => {
  const { data, isLoading: loading } = useDashboardInfo();

  const [searchTerm, setSearchTerm] = useState('');
  const [charityAddress, setCharityAddress] = useState('');
  const [priceIncrease, setPriceIncrease] = useState(0);
  const [timeIncrease, setTimeIncrease] = useState(0);
  const [timeIncrement, setTimeIncrement] = useState(0);
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

  const charityWalletContract = useContractNoSigner(CHARITY_WALLET_ADDRESS, CHARITY_WALLET_ABI);
  const cosmicGameContract = useContractNoSigner(COSMICGAME_ADDRESS, COSMICGAME_ABI);

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

    safeCall(async () => {
      const v = await cosmicGameContract.read.cstRewardAmountForBidding?.();
      setCstRewardAmountForBidding(Number(formatEther((v ?? 0n) as bigint)));
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
        reportError(e, 'fetch charity address');
      }
    };
    fetchData();
  }, [charityWalletContract]);

  const contracts = buildContracts(data?.ContractAddrs);

  return (
    <MainWrapper>
      <PageHeader
        title="Contract Addresses"
        subtitle="On-chain addresses and parameters for the Cosmic Signature protocol"
      >
        <NetworkBadge chainName={networkConfig.chainName} chainId={networkConfig.chainId} />
      </PageHeader>

      <div className="space-y-10">
        <motion.section
          variants={sectionFade}
          initial="hidden"
          animate="visible"
          aria-label="Fund Distribution"
        >
          <FundDistribution
            prizePercentage={data?.PrizePercentage}
            chronoWarriorPercentage={data?.ChronoWarriorPercentage}
            rafflePercentage={data?.RafflePercentage}
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
          aria-label="Protocol parameters"
        >
          <GameConfiguration
            priceIncrease={priceIncrease}
            timeIncrease={timeIncrease}
            timeIncrement={timeIncrement}
            cstRewardPerBid={cstRewardAmountForBidding}
            maxMessageLength={msgMaxLen}
            claimTimeout={data?.TimeoutClaimPrize ?? 0}
            initialIncrement={data?.InitialSecondsUntilPrize ?? 0}
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
          aria-label="Auction and Raffle Parameters"
        >
          <AuctionParameters
            cstDurations={cstDutchAuctionDurations}
            ethDurations={ethDutchAuctionDurations}
            cstBeginningBidPrice={cstDutchAuctionBeginningBidPriceMinLimit}
            charityAddress={charityAddress}
            charityPercentage={data?.CharityPercentage}
            explorerUrl={networkConfig.explorerUrl}
            raffleEthWinners={data?.NumRaffleEthWinnersBidding}
            raffleNftWinnersBidding={data?.NumRaffleNFTWinnersBidding}
            raffleNftWinnersStaking={data?.NumRaffleNFTWinnersStakingRWalk}
            loading={loading}
          />
        </motion.section>
      </div>
    </MainWrapper>
  );
};

export default Contracts;
