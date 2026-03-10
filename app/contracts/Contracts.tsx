'use client';

import { useEffect, useState } from 'react';
import { Typography, List, ListItem, useTheme, useMediaQuery, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { formatEther } from 'viem';

import { networkConfig } from '@/config/networks';
import { MainWrapper } from '@/components/styled';
import { formatSeconds } from '@/utils';
import { useNotification } from '@/contexts/NotificationContext';
import { useClipboard } from '@/hooks/useClipboard';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { reportError } from '@/utils/errors';
import useContractNoSigner from '@/hooks/useContractNoSigner';
import {
  charityWalletAbi as CHARITY_WALLET_ABI,
  cosmicGameAbi as COSMICGAME_ABI,
} from '@/contracts/abis';
import { CHARITY_WALLET_ADDRESS, COSMICGAME_ADDRESS } from '@/config/networks';

/**
 * Defines the structure of props accepted by the ContractItem component.
 */
interface ContractItemProps {
  name: string; // Name/label of the item (e.g., "Cosmic Token Address")
  value: string | number | undefined;
  copyable?: boolean; // Whether the item is copyable to clipboard
}

/**
 * ContractItem: Renders a list item with an optional copy-to-clipboard functionality.
 */
const ContractItem = ({ name, value, copyable = false }: ContractItemProps) => {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('md'));
  const sm = useMediaQuery(theme.breakpoints.up('sm'));
  const { setNotification } = useNotification();
  const { copy } = useClipboard();

  return (
    <ListItem>
      <Typography
        color="primary"
        sx={{
          mr: 2,
          minWidth: md ? '350px' : '150px',
          maxWidth: md ? '350px' : '150px',
        }}
        variant={sm ? 'subtitle1' : 'body1'}
      >
        {name}:
      </Typography>

      {copyable ? (
        <Box
          sx={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}
          onClick={() => {
            copy(value ? String(value) : '');
            setNotification({
              text: 'Address copied!',
              type: 'success',
              visible: true,
            });
          }}
        >
          <Typography
            fontFamily="monospace"
            variant={sm ? 'subtitle1' : 'body1'}
            sx={{ wordBreak: 'break-all', mr: 1 }}
          >
            {value}
          </Typography>
          <ContentCopyIcon fontSize="inherit" />
        </Box>
      ) : (
        <Typography
          fontFamily="monospace"
          variant={sm ? 'subtitle1' : 'body1'}
          sx={{ wordBreak: 'break-all' }}
        >
          {value}
        </Typography>
      )}
    </ListItem>
  );
};

/**
 * Defines the structure of the data returned by the API (simplified for demonstration).
 * Adjust the interface as needed based on your actual API response.
 */
interface ContractAddresses {
  CosmicGameAddr: string;
  CosmicTokenAddr: string;
  CosmicSignatureAddr: string;
  RandomWalkAddr: string;
  CosmicDaoAddr: string;
  CharityWalletAddr: string;
  MarketingWalletAddr: string;
  PrizesWalletAddr: string;
  StakingWalletCSTAddr: string;
  StakingWalletRWalkAddr: string;
}

interface DashboardData {
  ContractAddrs: ContractAddresses;
  PrizePercentage: number;
  ChronoWarriorPercentage: number;
  RafflePercentage: number;
  StakingPercentage: number;
  NumRaffleEthWinnersBidding: number;
  NumRaffleNFTWinnersBidding: number;
  NumRaffleNFTWinnersStakingRWalk: number;
  CharityPercentage: number;
  RoundStartCSTAuctionLength: number;
  TimeoutClaimPrize: number;
  InitialSecondsUntilPrize: number;
}

/**
 * Contracts: Main component to display all contract-related information
 * and default settings fetched from the server and the CharityWallet contract.
 */
const Contracts = () => {
  const { data: rawDashboard, isLoading: loading } = useDashboardInfo();
  const data = rawDashboard as unknown as DashboardData | null;
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

  /**
   * If the CharityWallet contract is loaded, fetch the charity address on mount.
   */
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

  /**
   * Contract Items: List of essential contracts or metadata to display in the first List.
   */
  const contractItems = [
    { name: 'Network', value: networkConfig.chainName },
    { name: 'Chain ID', value: networkConfig.chainId },
    {
      name: 'Cosmic Game Address',
      value: data?.ContractAddrs.CosmicGameAddr,
      copyable: true,
    },
    {
      name: 'Cosmic Signature Token Address',
      value: data?.ContractAddrs.CosmicTokenAddr,
      copyable: true,
    },
    {
      name: 'Cosmic Signature Address',
      value: data?.ContractAddrs.CosmicSignatureAddr,
      copyable: true,
    },
    {
      name: 'RandomWalk Address',
      value: data?.ContractAddrs.RandomWalkAddr,
      copyable: true,
    },
    {
      name: 'Cosmic DAO Address',
      value: data?.ContractAddrs.CosmicDaoAddr,
      copyable: true,
    },
    {
      name: 'Charity Wallet Address',
      value: data?.ContractAddrs.CharityWalletAddr,
      copyable: true,
    },
    {
      name: 'Marketing Wallet Address',
      value: data?.ContractAddrs.MarketingWalletAddr,
      copyable: true,
    },
    {
      name: 'Prizes Wallet Address',
      value: data?.ContractAddrs.PrizesWalletAddr,
      copyable: true,
    },
    {
      name: 'Cosmic Signature Staking Wallet Address',
      value: data?.ContractAddrs.StakingWalletCSTAddr,
      copyable: true,
    },
    {
      name: 'Random Walk Staking Wallet Address',
      value: data?.ContractAddrs.StakingWalletRWalkAddr,
      copyable: true,
    },
  ];

  /**
   * Configuration Items: List of additional contract configurations.
   */
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
      value: data ? formatSeconds(data.TimeoutClaimPrize) : '--',
    },
    { name: 'Maximum message length', value: Number(msgMaxLen) },
    {
      name: 'Initial increment first bid',
      value: data ? formatSeconds(data.InitialSecondsUntilPrize) : '--',
    },
    {
      name: 'CST dutch auction beginning bid price',
      value: `${Number(cstDutchAuctionBeginningBidPriceMinLimit)} CST`,
    },
  ];

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" align="center">
        Contract Addresses
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <>
          {/* List of essential contract addresses */}
          <List sx={{ mt: 4 }}>
            {contractItems.map(({ name, value, copyable }) => (
              <ContractItem key={name} name={name} value={value} copyable={copyable} />
            ))}
          </List>

          {/* List of additional contract configurations */}
          <Typography variant="h6" mt={5} mb={3}>
            Current configuration of the contracts
          </Typography>
          <List>
            {configItems.map(({ name, value, copyable }) => (
              <ContractItem key={name} name={name} value={value} copyable={copyable} />
            ))}
          </List>
        </>
      )}
    </MainWrapper>
  );
};

export default Contracts;
