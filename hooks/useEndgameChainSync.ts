'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useNow } from '@/hooks/useNow';
import { fetchEndgameChainSample, type EndgameChainSample } from '@/lib/rpcRace';
import { useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';
import type { DashboardInfo } from '@/services/api';
import { reportError } from '@/utils/errors';

/** How far before the deadline the 1s direct-chain reads start. */
export const ENDGAME_LEAD_MS = 60_000;

/** How long past the deadline the reads keep running while unresolved. */
export const ENDGAME_TAIL_MS = 120_000;

/** Interval between direct-chain reads inside the endgame window. */
export const ENDGAME_SAMPLE_INTERVAL_MS = 1_000;

/**
 * Interval used right at the zero-cross, while the outcome (extension vs.
 * truly ready) is still unresolved on-chain. This is the decisive moment the
 * whole feature exists for, so sampling tightens to sub-second.
 */
export const ENDGAME_ZERO_CROSS_SAMPLE_INTERVAL_MS = 300;

/**
 * If the zero-cross cannot be verified on-chain within this grace period
 * (all RPC reads failing), degrade to the legacy behavior of showing the
 * ready state rather than blocking the UI on a spinner forever.
 */
export const CONFIRMATION_GRACE_MS = 8_000;

export interface EndgameChainSyncResult {
  /**
   * True while the local countdown has crossed zero but on-chain state has
   * not yet confirmed that the deadline really passed. UI should show a
   * "verifying on-chain" state instead of "ready to finalize".
   */
  isConfirmationPending: boolean;
  /** True once a sampled `roundNum` increment shows the prize was claimed. */
  isClaimedOnChain: boolean;
  /** Latest successful direct-chain sample, if any. */
  lastSample: EndgameChainSample | null;
}

/**
 * Endgame synchronizer: in the final minute of a cycle (and briefly after the
 * deadline) reads `mainPrizeTime` / `lastBidderAddress` / `roundNum` plus the
 * latest block timestamp every second — tightening to 300ms around the
 * zero-cross itself — straight from the RPC nodes (see
 * lib/rpcRace — both nodes raced in parallel, backend/ETL bypassed), and
 * pushes the fresh values into the React Query cache so every consumer of
 * `allocationTime` / `currentTime` / dashboard data updates within ~1–2s of
 * on-chain reality:
 *
 * - a last-second Gesture moves the cached prize time immediately (the
 *   countdown jumps back up instead of freezing at 00:00);
 * - a claim is detected via the `roundNum` increment and triggers a full
 *   live-data refresh;
 * - the zero-cross is only presented as "ready to finalize" once a sample
 *   taken by the contract's own clock (block timestamp) confirms it.
 */
export function useEndgameChainSync({
  targetMs,
  enabled = true,
}: {
  /** Client-epoch ms of the finalization deadline (allocationTime). */
  targetMs: number;
  enabled?: boolean;
}): EndgameChainSyncResult {
  const queryClient = useQueryClient();
  const { cosmicGame } = useContractAddresses();
  const uxScenario = useUxScenarioSnapshot();
  const now = useNow(1000);
  const effectiveEnabled = enabled && !uxScenario;

  const [lastSample, setLastSample] = useState<EndgameChainSample | null>(null);
  const [isClaimedOnChain, setIsClaimedOnChain] = useState(false);

  const baselineRoundRef = useRef<number | null>(null);
  const zeroCrossAtMsRef = useRef<number | null>(null);
  const failureReportedRef = useRef(false);

  const hasTarget = Number.isFinite(targetMs) && targetMs > 0;
  const crossed = hasTarget && now >= targetMs;

  if (crossed && zeroCrossAtMsRef.current == null) {
    zeroCrossAtMsRef.current = now;
  } else if (!crossed && zeroCrossAtMsRef.current != null) {
    // Deadline moved into the future (extension) or a new round started.
    zeroCrossAtMsRef.current = null;
  }

  const active =
    effectiveEnabled &&
    !!cosmicGame &&
    hasTarget &&
    !isClaimedOnChain &&
    now >= targetMs - ENDGAME_LEAD_MS &&
    now <= targetMs + ENDGAME_TAIL_MS;

  const confirmedBySample =
    lastSample != null && lastSample.blockTimestampSec >= lastSample.mainPrizeTimeSec;

  // Right at the zero-cross the very next block decides between "extended"
  // and "ready", so sampling tightens to 300ms until the outcome is known
  // (confirmation, extension, or claim), then relaxes back to 1s. The fast
  // mode arms a few seconds early because `now` ticks at 1s granularity —
  // this guarantees sub-second sampling is already running at the instant
  // the counter hits zero.
  const nearOrPastZero = hasTarget && targetMs - now <= 3_000;
  const sampleIntervalMs =
    nearOrPastZero && !confirmedBySample && !isClaimedOnChain
      ? ENDGAME_ZERO_CROSS_SAMPLE_INTERVAL_MS
      : ENDGAME_SAMPLE_INTERVAL_MS;

  useEffect(() => {
    if (!active || !cosmicGame) return undefined;

    let cancelled = false;
    let inFlight = false;

    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const sample = await fetchEndgameChainSample(cosmicGame);
        if (cancelled) return;
        failureReportedRef.current = false;
        setLastSample(sample);

        if (baselineRoundRef.current == null) {
          baselineRoundRef.current = sample.roundNum;
        } else if (sample.roundNum > baselineRoundRef.current) {
          // Main prize claimed: the contract moved to the next round.
          setIsClaimedOnChain(true);
          void invalidateLiveGameQueries(queryClient);
          void queryClient.invalidateQueries({ queryKey: ['claimHistory'] });
          void queryClient.invalidateQueries({ queryKey: ['roundList'] });
          return;
        }

        const previousAllocationTime = queryClient.getQueryData<number>(['allocationTime']);
        queryClient.setQueryData(['allocationTime'], sample.mainPrizeTimeSec);
        queryClient.setQueryData(['currentTime'], sample.blockTimestampSec);
        queryClient.setQueryData<DashboardInfo | null>(['dashboardInfo'], (current) => {
          if (!current || current.CurRoundNum !== sample.roundNum) return current;
          if (current.LastBidderAddr === sample.lastBidderAddress) return current;
          return { ...current, LastBidderAddr: sample.lastBidderAddress };
        });

        if (
          typeof previousAllocationTime === 'number' &&
          sample.mainPrizeTimeSec > previousAllocationTime
        ) {
          // A new Gesture extended the cycle; pull the full bid data.
          void queryClient.invalidateQueries({ queryKey: ['bidListByRound'] });
          void queryClient.invalidateQueries({ queryKey: ['dashboardInfo'] });
        }
      } catch (error) {
        if (!cancelled && !failureReportedRef.current) {
          failureReportedRef.current = true;
          reportError(error, 'endgame chain sync');
        }
      } finally {
        inFlight = false;
      }
    };

    void tick();
    const intervalId = window.setInterval(() => void tick(), sampleIntervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [active, cosmicGame, queryClient, sampleIntervalMs]);

  // A new cycle (or a target far in the future) resets the claim latch so the
  // hook can arm again for the next endgame.
  useEffect(() => {
    if (!crossed && isClaimedOnChain) {
      setIsClaimedOnChain(false);
      baselineRoundRef.current = null;
    }
  }, [crossed, isClaimedOnChain]);

  const zeroCrossAtMs = zeroCrossAtMsRef.current;
  const withinGrace = zeroCrossAtMs != null && now - zeroCrossAtMs < CONFIRMATION_GRACE_MS;
  const isConfirmationPending =
    crossed && effectiveEnabled && !isClaimedOnChain && !confirmedBySample && withinGrace;

  return { isConfirmationPending, isClaimedOnChain, lastSample };
}
