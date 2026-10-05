'use client';

import { useLiveGameDataRefresh } from '@/hooks/useLiveGameDataRefresh';

/** The chain-event refresh as a component, loaded on demand by LiveGameDataRefreshGate. */
export default function LiveGameDataRefreshIsland() {
  useLiveGameDataRefresh();
  return null;
}
