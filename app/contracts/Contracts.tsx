'use client';

import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { formatEther } from 'viem';

import { formatSeconds } from '@/utils';
import {
  charityWalletAbi as CHARITY_WALLET_ABI,
  cosmicGameAbi as COSMICGAME_ABI,
} from '@/contracts/abis';

import { networkConfig } from '@/config/networks';
import { MainWrapper } from '@/components/styled';
import { useNotification } from '@/contexts/NotificationContext';
import { useClipboard } from '@/hooks/useClipboard';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { reportError } from '@/utils/errors';
import useContractNoSigner from '@/hooks/useContractNoSigner';
import { CHARITY_WALLET_ADDRESS, COSMICGAME_ADDRESS } from '@/config/networks';

interface ContractItemProps {
  name: string;
  value: string | number | undefined;
  copyable?: boolean;
}

const ContractItem = ({ name, value, copyable = false }: ContractItemProps) => {
  const { setNotification } = useNotification();
  const { copy } = useClipboard();

  return (
    <li className="flex items-start py-2">
      <span className="text-primary mr-4 min-w-[150px] max-w-[150px] md:min-w-[350px] md:max-w-[350px] text-sm sm:text-base font-medium">
        {name}:
      </span>

      {copyable ? (
        <div
          className="flex cursor-pointer items-center"
          onClick={() => {
            copy(value ? String(value) : '');
            setNotification({
              text: 'Address copied!',
              type: 'success',
              visible: true,
            });
          }}
        >
          <span className="font-mono text-sm sm:text-base break-all mr-2">{value}</span>
          <Copy className="h-4 w-4 shrink-0" />
        </div>
      ) : (
        <span className="font-mono text-sm sm:text-base break-all">{value}</span>
      )}
    </li>
  );
};

const Contracts = () => {
  const { data, isLoading: loading } = useDashboardInfo();
  const [charityAddress, setCharityAddress] = useState('');
  const [priceIncrease, setPriceIncrease] = useState(0);
  const [timeIncrease, setTimeIncrease] = useState(0);
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

  const contractItems = [
    { name: 'Network', value: networkConfig.chainName },
    { name: 'Chain ID', value: networkConfig.chainId },
    {
      name: 'Cosmic Game Address',
      value: data?.ContractAddrs?.CosmicGameAddr,
      copyable: true,
    },
    {
      name: 'Cosmic Signature Token Address',
      value: data?.ContractAddrs?.CosmicTokenAddr,
      copyable: true,
    },
    {
      name: 'Cosmic Signature Address',
      value: data?.ContractAddrs?.CosmicSignatureAddr,
      copyable: true,
    },
    {
      name: 'RandomWalk Address',
      value: data?.ContractAddrs?.RandomWalkAddr,
      copyable: true,
    },
    {
      name: 'Cosmic DAO Address',
      value: data?.ContractAddrs?.CosmicDaoAddr,
      copyable: true,
    },
    {
      name: 'Charity Wallet Address',
      value: data?.ContractAddrs?.CharityWalletAddr,
      copyable: true,
    },
    {
      name: 'Marketing Wallet Address',
      value: data?.ContractAddrs?.MarketingWalletAddr,
      copyable: true,
    },
    {
      name: 'Prizes Wallet Address',
      value: data?.ContractAddrs?.PrizesWalletAddr,
      copyable: true,
    },
    {
      name: 'Cosmic Signature Staking Wallet Address',
      value: data?.ContractAddrs?.StakingWalletCSTAddr,
      copyable: true,
    },
    {
      name: 'Random Walk Staking Wallet Address',
      value: data?.ContractAddrs?.StakingWalletRWalkAddr,
      copyable: true,
    },
  ];

  const configItems = [
    { name: 'Price Increase', value: `${priceIncrease}%` },
    { name: 'Time Increase', value: `${timeIncrease}%` },
    {
      name: 'Prize Percentage',
      value: data ? `${data.PrizePercentage}%` : '--',
    },
    {
      name: 'Chrono Warrior Percentage',
      value: data ? `${data.ChronoWarriorPercentage}%` : '--',
    },
    {
      name: 'Raffle Percentage',
      value: data ? `${data.RafflePercentage}%` : '--',
    },
    {
      name: 'Staking Percentage',
      value: data ? `${data.StakingPercentage}%` : '--',
    },
    {
      name: 'Raffle ETH Winners for Bidding',
      value: data?.NumRaffleEthWinnersBidding,
    },
    {
      name: 'Raffle NFT Winners for Bidding',
      value: data?.NumRaffleNFTWinnersBidding,
    },
    {
      name: 'Raffle NFT Winners for Staking Random Walk',
      value: data?.NumRaffleNFTWinnersStakingRWalk,
    },
    {
      name: 'Charity Address',
      value: charityAddress,
      copyable: true,
    },
    {
      name: 'Charity Percentage',
      value: data ? `${data.CharityPercentage}%` : '--',
    },
    {
      name: 'Amount of CosmicTokens earned per bid',
      value: `${Number(cstRewardAmountForBidding)} CST`,
    },
    {
      name: 'CST Dutch Auction Duration',
      value: data ? formatSeconds(cstDutchAuctionDurations.AuctionDuration) : '--',
    },
    {
      name: 'CST Dutch Auction Elapsed Duration',
      value: data ? formatSeconds(cstDutchAuctionDurations.ElapsedDuration) : '--',
    },
    {
      name: 'ETH Dutch Auction Duration',
      value: data ? formatSeconds(ethDutchAuctionDurations.AuctionDuration) : '--',
    },
    {
      name: 'ETH Dutch Auction Elapsed Duration',
      value: data ? formatSeconds(ethDutchAuctionDurations.ElapsedDuration) : '--',
    },
    {
      name: 'Timeout to claim prize',
      value: data ? formatSeconds(data.TimeoutClaimPrize ?? 0) : '--',
    },
    { name: 'Maximum message length', value: Number(msgMaxLen) },
    {
      name: 'Initial increment first bid',
      value: data ? formatSeconds(data.InitialSecondsUntilPrize ?? 0) : '--',
    },
    {
      name: 'CST dutch auction beginning bid price',
      value: `${Number(cstDutchAuctionBeginningBidPriceMinLimit)} CST`,
    },
  ];

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center">Contract Addresses</h4>

      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <>
          <ul className="mt-8 list-none p-0">
            {contractItems.map(({ name, value, copyable }) => (
              <ContractItem key={name} name={name} value={value} copyable={copyable} />
            ))}
          </ul>

          <h6 className="text-lg font-semibold mt-10 mb-6">
            Current configuration of the contracts
          </h6>
          <ul className="list-none p-0">
            {configItems.map(({ name, value, copyable }) => (
              <ContractItem key={name} name={name} value={value} copyable={copyable} />
            ))}
          </ul>
        </>
      )}
    </MainWrapper>
  );
};

export default Contracts;
