'use client';

import { useSyncExternalStore } from 'react';

import type {
  CTPriceInfo,
  DashboardInfo,
  DonatedERC20Token,
  AttachedNFT,
  GestureEthCostInfo,
  GestureInfo,
  SpecialRecipients,
} from '@/services/api/types';

export type UxCycleScenarioName =
  | 'live-low-time'
  | 'live-mid-cycle'
  | 'final-hour'
  | 'final-ten'
  | 'waiting-first-gesture'
  | 'ready-to-finalize'
  | 'opening-soon';

export const UX_SCENARIO_DEMO_ACCOUNT = '0x1111111111111111111111111111111111111111';
const OTHER_PARTICIPANT = '0x2222222222222222222222222222222222222222';
const PROTOCOL_PROXY = '0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2';
const IMPLEMENTATION = '0x50eB3d05d2C463949DE9238D419385594f7AdB97';
const CST_TOKEN = '0xAD91843e6A58Ba560F577E676986AFb1dba6FBA0';
const COSMIC_SIGNATURE_NFT = '0xbb84Be3500A63581d3F2d5AC3bdF8685AAedad25';
const RANDOM_WALK_NFT = '0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08';
const PUBLIC_GOODS_VAULT = '0x96bB0ADB414d5350f435E52f94946B6C7A0760a9';
const OUTREACH_RESERVE = '0xa3802c799f5e3D3D3562A9B513a41C6aAF92e25e';
const ALLOCATIONS_WALLET = '0xE1b619e9B39ea4109D2F429Ea5eAA307759b0011';
const CST_ANCHORING_WALLET = '0x6308A405B4FF1eA890870Efe2a6D036750B81F7C';
const RWLK_ANCHORING_WALLET = '0x5EB3396092841E6c5b0b51141699F6711E830529';

interface ScenarioConfig {
  remainingSeconds: number;
  lastBidder: string;
  roundStarted: boolean;
  activationOffsetSeconds?: number;
}

interface UxCycleScenarioState {
  name: UxCycleScenarioName;
  createdAtMs: number;
  currentTimeSec: number;
  finalizationTimeSec: number;
  extensionSeconds: number;
  dashboard: DashboardInfo;
  gestures: GestureInfo[];
  ethCost: GestureEthCostInfo;
  cstPrice: CTPriceInfo;
  donationsNft: AttachedNFT[];
  donationsErc20: DonatedERC20Token[];
  specialRecipients: SpecialRecipients;
  simulatedBidCount: number;
}

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();
let state: UxCycleScenarioState | null = null;
let stateName: UxCycleScenarioName | null = null;

function isDevelopmentScenarioMode(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function isScenarioName(value: string | null | undefined): value is UxCycleScenarioName {
  return (
    value === 'live-low-time' ||
    value === 'live-mid-cycle' ||
    value === 'final-hour' ||
    value === 'final-ten' ||
    value === 'waiting-first-gesture' ||
    value === 'ready-to-finalize' ||
    value === 'opening-soon'
  );
}

export function getRequestedUxScenarioName(): UxCycleScenarioName | null {
  if (!isDevelopmentScenarioMode()) return null;
  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get('uxScenario');
    if (isScenarioName(fromQuery)) return fromQuery;
  }
  const fromEnv = process.env.NEXT_PUBLIC_UX_SCENARIO;
  return isScenarioName(fromEnv) ? fromEnv : null;
}

function scenarioConfig(name: UxCycleScenarioName): ScenarioConfig {
  switch (name) {
    case 'live-mid-cycle':
      return { remainingSeconds: 13 * 60 * 60, lastBidder: OTHER_PARTICIPANT, roundStarted: true };
    case 'final-hour':
      return { remainingSeconds: 45 * 60, lastBidder: OTHER_PARTICIPANT, roundStarted: true };
    case 'final-ten':
      return { remainingSeconds: 8 * 60, lastBidder: OTHER_PARTICIPANT, roundStarted: true };
    case 'waiting-first-gesture':
      return {
        remainingSeconds: 10 * 60,
        lastBidder: '0x0000000000000000000000000000000000000000',
        roundStarted: false,
      };
    case 'ready-to-finalize':
      return { remainingSeconds: -30, lastBidder: OTHER_PARTICIPANT, roundStarted: true };
    case 'opening-soon':
      return {
        remainingSeconds: 10 * 60,
        lastBidder: '0x0000000000000000000000000000000000000000',
        roundStarted: false,
        activationOffsetSeconds: 2 * 60,
      };
    case 'live-low-time':
    default:
      return { remainingSeconds: 3 * 60, lastBidder: OTHER_PARTICIPANT, roundStarted: true };
  }
}

function makeGesture({
  bidder,
  eventId,
  gestureType,
  message,
  round,
  timestamp,
}: {
  bidder: string;
  eventId: number;
  gestureType: number;
  message: string;
  round: number;
  timestamp: number;
}): GestureInfo {
  return {
    EvtLogId: eventId,
    BlockNum: 100_000 + eventId,
    TxId: eventId,
    TxHash: `0x${eventId.toString(16).padStart(64, '0')}`,
    TimeStamp: timestamp,
    DateTime: new Date(timestamp * 1000).toISOString(),
    RoundNum: round,
    BidderAddr: bidder,
    Message: message,
    GestureType: gestureType,
    GestureCostEth: gestureType === 2 ? 0 : 0.012,
    CstCost: gestureType === 2 ? 1.5 : 0,
    ParticipationCST: 100,
  };
}

function buildScenario(name: UxCycleScenarioName): UxCycleScenarioState {
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const round = 42;
  const config = scenarioConfig(name);
  const finalizationTimeSec = nowSec + config.remainingSeconds;
  const activationTime = config.activationOffsetSeconds
    ? nowSec + config.activationOffsetSeconds
    : 0;
  const roundStart = config.roundStarted ? nowSec - 60 * 60 : 0;
  const initialGesture = makeGesture({
    bidder: config.lastBidder,
    eventId: 9001,
    gestureType: 0,
    message: 'Local UX scenario: previous gesture',
    round,
    timestamp: nowSec - 90,
  });

  const dashboard: DashboardInfo = {
    CurNumBids: config.roundStarted ? 8 : 0,
    CurPrizeAmountEth: 2.4,
    CurBidPriceEth: 0.012,
    CurRoundNum: round,
    PrizeClaimTs: finalizationTimeSec,
    TsRoundStart: roundStart,
    LastBidderAddr: config.lastBidder,
    GestureCostEth: 0.012,
    StakingAmountEth: 0,
    CurRoundPrizeTime: finalizationTimeSec,
    PrizeAmountEth: 2.4,
    RaffleAmountEth: 0.42,
    CosmicGameBalanceEth: 8.75,
    PrizePercentage: 25,
    ChronoWarriorPercentage: 8,
    RafflePercentage: 4,
    StakingPercentage: 6,
    CharityPercentage: 7,
    NumRaffleEthWinnersBidding: 3,
    NumRaffleNFTWinnersBidding: 10,
    NumRaffleNFTWinnersStakingRWalk: 10,
    TimeoutClaimPrize: 300,
    CurRoundStats: {
      TotalBids: config.roundStarted ? 8 : 0,
      TotalDonatedAmountEth: 0.35,
      TotalDonatedNFTs: 2,
      ActivationTime: activationTime || undefined,
    },
    MainStats: {
      NumCSTokenMints: 128,
      TotalRaffleEthDeposits: 12.5,
      TotalCSTConsumedEth: 25_000,
      TotalMktRewardsEth: 3_000,
      NumMktRewards: 15,
      TotalRaffleEthWithdrawn: 8.25,
      NumBidsCST: 3,
      NumUniqueBidders: 6,
      NumUniqueWinners: 4,
      NumUniqueDonors: 3,
      TotalNamedTokens: 21,
      NumUniqueStakersCST: 11,
      NumUniqueStakersRWalk: 9,
      SumCosmicGameDonationsEth: 1.2,
      SumWithdrawals: 0.4,
      StakeStatisticsCST: {
        TotalTokensStaked: 40,
        NumActiveStakers: 11,
        NumDeposits: 10,
        TotalRewardEth: 0.8,
      },
      StakeStatisticsRWalk: {
        TotalTokensStaked: 18,
        NumActiveStakers: 9,
      },
    },
    ContractAddrs: {
      CosmicGameAddr: PROTOCOL_PROXY,
      ImplementationAddr: IMPLEMENTATION,
      CosmicTokenAddr: CST_TOKEN,
      CosmicSignatureAddr: COSMIC_SIGNATURE_NFT,
      RandomWalkAddr: RANDOM_WALK_NFT,
      CosmicDaoAddr: PROTOCOL_PROXY,
      CharityWalletAddr: PUBLIC_GOODS_VAULT,
      MarketingWalletAddr: OUTREACH_RESERVE,
      PrizesWalletAddr: ALLOCATIONS_WALLET,
      StakingWalletCSTAddr: CST_ANCHORING_WALLET,
      StakingWalletRWalkAddr: RWLK_ANCHORING_WALLET,
    },
  };

  return {
    name,
    createdAtMs: nowMs,
    currentTimeSec: nowSec,
    finalizationTimeSec,
    extensionSeconds: 25,
    dashboard,
    gestures: config.roundStarted ? [initialGesture] : [],
    ethCost: {
      AuctionDuration: '43200',
      ETHPrice: '12000000000000000',
      SecondsElapsed: '3600',
    },
    cstPrice: {
      AuctionDuration: '43200',
      CSTPrice: '1500000000000000000',
      SecondsElapsed: '39600',
    },
    donationsNft: [],
    donationsErc20: [],
    specialRecipients: {
      EnduranceChampionAddress: config.lastBidder,
      EnduranceChampionDuration: 90,
      EnduranceChampionStartTimeStamp: nowSec - 90,
      PrevEnduranceChampionDuration: 0,
      ChronoWarriorAddress: config.lastBidder,
      ChronoWarriorDuration: 60,
      ChronoWarriorIsLive: true,
      LastBidderAddress: config.lastBidder,
      LastBidderLastBidTime: nowSec - 90,
      LastCstBidderAddress: OTHER_PARTICIPANT,
      LastCstBidderLastBidTime: nowSec - 180,
      LastCstBidEventLogId: 8999,
      RoundNum: round,
      SourceBlockNumber: 100_000,
      SourceBlockTimeStamp: nowSec,
    },
    simulatedBidCount: 0,
  };
}

function getSnapshot(): UxCycleScenarioState | null {
  const requested = getRequestedUxScenarioName();
  if (!requested) return null;
  if (!state || stateName !== requested) {
    state = buildScenario(requested);
    stateName = requested;
  }
  return state;
}

function subscribe(callback: Subscriber): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function emit(): void {
  for (const subscriber of subscribers) subscriber();
}

export function useUxScenarioSnapshot(): UxCycleScenarioState | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function getUxScenarioSnapshot(): UxCycleScenarioState | null {
  return getSnapshot();
}

export function resetUxScenarioForTest(): void {
  state = null;
  stateName = null;
  emit();
}

export function simulateUxScenarioGesture({
  bidder,
  gestureType,
  message,
}: {
  bidder: string;
  gestureType: 'ETH' | 'RandomWalk' | 'CST';
  message: string;
}): UxCycleScenarioState | null {
  const current = getSnapshot();
  if (!current) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  const gestureKind = gestureType === 'CST' ? 2 : gestureType === 'RandomWalk' ? 1 : 0;
  const nextGestureCount = current.simulatedBidCount + 1;
  const eventId = 9100 + nextGestureCount;
  const finalizationTimeSec =
    Math.max(current.finalizationTimeSec, nowSec) + current.extensionSeconds;
  const nextGesture = makeGesture({
    bidder,
    eventId,
    gestureType: gestureKind,
    message: message || `Simulated ${gestureType} gesture`,
    round: current.dashboard.CurRoundNum,
    timestamp: nowSec,
  });

  state = {
    ...current,
    createdAtMs: Date.now(),
    currentTimeSec: nowSec,
    finalizationTimeSec,
    simulatedBidCount: nextGestureCount,
    gestures: [nextGesture, ...current.gestures],
    dashboard: {
      ...current.dashboard,
      CurNumBids: (current.dashboard.CurNumBids ?? 0) + 1,
      PrizeClaimTs: finalizationTimeSec,
      CurRoundPrizeTime: finalizationTimeSec,
      LastBidderAddr: bidder,
      CurRoundStats: {
        ...(current.dashboard.CurRoundStats ?? {}),
        TotalBids: Number(current.dashboard.CurRoundStats?.TotalBids ?? 0) + 1,
      },
    },
    ethCost: {
      ...current.ethCost,
      ETHPrice: '121200000000000000',
    },
    cstPrice: {
      ...current.cstPrice,
      CSTPrice: gestureType === 'CST' ? '1400000000000000000' : current.cstPrice.CSTPrice,
    },
    specialRecipients: {
      ...current.specialRecipients,
      LastBidderAddress: bidder,
      LastBidderLastBidTime: nowSec,
      LastCstBidderAddress:
        gestureType === 'CST' ? bidder : current.specialRecipients.LastCstBidderAddress,
      LastCstBidderLastBidTime:
        gestureType === 'CST' ? nowSec : current.specialRecipients.LastCstBidderLastBidTime,
      LastCstBidEventLogId:
        gestureType === 'CST' ? eventId : current.specialRecipients.LastCstBidEventLogId,
      SourceBlockTimeStamp: nowSec,
    },
  };
  emit();
  return state;
}
