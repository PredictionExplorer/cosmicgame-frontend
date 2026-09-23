import type { Hash } from 'viem';

import type { TxErrorInfo } from '@/lib/txErrors';

/**
 * Where a transaction flow is. One value drives the trigger label, the inline
 * `TxStatus` strip and the single lifecycle toast, so all three always agree.
 *
 * `step`/`total` count wallet prompts: attaching an NFT to a gesture is
 * "Approve 1 of 2" then "Confirm 2 of 2".
 */
export type TxStage =
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'switching-network' }
  | {
      status: 'approving';
      step: number;
      total: number;
      /** `signature` while the wallet prompt is open, `pending` while it mines. */
      phase: 'signature' | 'pending';
      hash?: Hash;
    }
  | { status: 'awaiting-signature'; step: number; total: number }
  | { status: 'pending'; hash: Hash }
  | { status: 'confirmed'; hash: Hash }
  | { status: 'failed'; error: TxErrorInfo; message: string; hash?: Hash }
  | { status: 'cancelled' };

export type TxStatusName = TxStage['status'];

export const IDLE_TX_STAGE: TxStage = { status: 'idle' };

const BUSY_STATUSES: ReadonlySet<TxStatusName> = new Set([
  'preparing',
  'switching-network',
  'approving',
  'awaiting-signature',
  'pending',
]);

/** True while the flow holds the wallet or waits on the chain. Disable the trigger. */
export function isTxBusy(stage: TxStage): boolean {
  return BUSY_STATUSES.has(stage.status);
}

/** Hash of the transaction the stage refers to, when there is one. */
export function txStageHash(stage: TxStage): Hash | undefined {
  return 'hash' in stage ? stage.hash : undefined;
}
