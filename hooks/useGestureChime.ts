'use client';

import { useEffect, useRef } from 'react';

import { useAttentionPreferences } from '@/hooks/useAttentionPreferences';
import { sameAddress } from '@/utils/format';
import { reportError } from '@/utils/errors';

/** 0.9 s mono MP3 (about 6 KB), fetched only after the viewer turns sound on. */
export const GESTURE_CHIME_SRC = '/audio/gesture-chime.mp3';
const CHIME_VOLUME = 0.5;

let chimeElement: HTMLAudioElement | null = null;

function isAutoplayPolicyError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotAllowedError';
}

function getChimeElement(): HTMLAudioElement {
  if (!chimeElement) {
    chimeElement = new Audio(GESTURE_CHIME_SRC);
    chimeElement.preload = 'auto';
    chimeElement.volume = CHIME_VOLUME;
  }
  return chimeElement;
}

/**
 * Plays the chime once. Call it from the click that turns sound ON: that
 * user gesture unlocks audio playback for the page (browsers refuse `play()`
 * from timers otherwise), and the viewer hears what they just enabled.
 */
export async function previewGestureChime(): Promise<void> {
  try {
    const element = getChimeElement();
    element.currentTime = 0;
    await element.play();
  } catch (error) {
    if (!isAutoplayPolicyError(error)) reportError(error, 'gesture-chime-preview');
  }
}

async function playGestureChime(): Promise<void> {
  try {
    const element = getChimeElement();
    element.currentTime = 0;
    await element.play();
  } catch (error) {
    // Not unlocked yet in this page view (the viewer enabled sound in an
    // earlier visit): stay silent rather than prompting.
    if (!isAutoplayPolicyError(error)) reportError(error, 'gesture-chime');
  }
}

/** Test-only: drop the cached audio element. */
export function resetGestureChimeForTest(): void {
  chimeElement = null;
}

export interface GestureChimeInput {
  /** The connected wallet, or null. */
  account: string | null | undefined;
  /** Latest participant of the live cycle (dashboard `LastBidderAddr`). */
  lastGestureAddress: string | null | undefined;
  /** Gestures in the live cycle (dashboard `CurNumBids`). */
  gestureCount: number | null | undefined;
}

/**
 * Plays a short chime when the viewer's Gesture has just been followed:
 * sound is on (attention preferences, off by default), a wallet is connected,
 * the connected wallet WAS the latest participant, a new Gesture arrived, and
 * the latest participant is now someone else. Visitors and anyone who did not
 * opt in never hear anything.
 */
export function useGestureChime({ account, lastGestureAddress, gestureCount }: GestureChimeInput) {
  const { preferences } = useAttentionPreferences();
  const previousRef = useRef<{ last: string | null; count: number } | null>(null);

  useEffect(() => {
    if (gestureCount == null) return;
    const previous = previousRef.current;
    previousRef.current = { last: lastGestureAddress ?? null, count: gestureCount };
    if (!previous || !preferences.sound || !account) return;

    const wasLatest = sameAddress(previous.last, account);
    const stillLatest = sameAddress(lastGestureAddress, account);
    if (wasLatest && !stillLatest && gestureCount > previous.count) {
      void playGestureChime();
    }
  }, [account, gestureCount, lastGestureAddress, preferences.sound]);
}
