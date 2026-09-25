'use client';

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useConfig, useConnection, usePublicClient, useSwitchChain } from 'wagmi';
import {
  sendTransaction,
  writeContract,
  type Config,
  type WriteContractParameters,
} from '@wagmi/core';
import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  Hash,
  TransactionReceipt,
} from 'viem';

import { activeChain } from '@/config/chains';
import { TxExplorerLink } from '@/components/ui/tx-status';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useOptionalWalletUi } from '@/contexts/WalletUiContext';
import { useTxErrorMessage } from '@/hooks/useTxErrorMessage';
import {
  ChainGuardError,
  EXPLORER_NAME,
  REQUIRED_CHAIN_NAME,
  ensureWalletOnRequiredChain,
} from '@/lib/chainGuard';
import {
  TxCancelledInWalletError,
  TxClientUnavailableError,
  TxRevertedError,
  classifyTxError,
  type TxErrorInfo,
} from '@/lib/txErrors';
import { IDLE_TX_STAGE, isTxBusy, type TxStage } from '@/lib/txStage';
import {
  assertTrustedTarget,
  assertTrustedWrite,
  readTrustedAddresses,
  type ContractReader,
} from '@/lib/writeTargets';
import {
  contractErrorNameOf,
  getContractErrorDescriptor,
  withDecodedContractError,
} from '@/utils/contractErrors';
import { reportError, reportErrorThrottled } from '@/utils/errors';

export { isTxBusy, txStageHash, type TxStage, type TxStatusName } from '@/lib/txStage';
export { useTxStageLabel } from '@/hooks/useTxStageLabel';

/* ────────────────────────────────────────────────────────────────── */
/*  Run options                                                      */
/* ────────────────────────────────────────────────────────────────── */

type WritableFunctionName<abi extends Abi | readonly unknown[]> = ContractFunctionName<
  abi,
  'nonpayable' | 'payable'
>;

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * wagmi `writeContract` parameters minus the chain: the flow always writes on
 * the protocol's chain, after the chain guard has run.
 */
export type TxWriteRequest<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends WritableFunctionName<abi> = WritableFunctionName<abi>,
  args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName> =
    ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
> = DistributiveOmit<
  WriteContractParameters<abi, functionName, args, Config>,
  'chainId' | 'connector'
>;

export interface TxContext {
  /** The connected account the flow started with. */
  account: Address;
  /**
   * Sends a contract write on the protocol's chain. With `sendTransaction`,
   * it is the only way a flow transacts. Before the wallet prompt it
   *
   * 1. checks the target (or, for an approval, the spender) against the
   *    protocol's contracts read on-chain from the game proxy
   *    (`lib/writeTargets`), and
   * 2. simulates the call from the connected account, so a transaction the
   *    contract would reject fails here, with its decoded custom error,
   *    instead of being signed and mined. Only a simulation that cannot run
   *    at all (the RPC is down) lets the write through to the wallet's own
   *    estimate.
   *
   * The signer is resolved when this runs (after any network switch), never
   * captured at render.
   */
  writeContract: <
    const abi extends Abi | readonly unknown[],
    functionName extends WritableFunctionName<abi>,
    args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  >(
    request: TxWriteRequest<abi, functionName, args>,
  ) => Promise<Hash>;
  /**
   * Sends plain ETH, with no calldata, on the protocol's chain: a payment to
   * a contract's `receive()` (the Public Goods Vault). Guarded as
   * `writeContract` is: the recipient must be one of the protocol's
   * contracts read on-chain (the vault's address comes from the dashboard
   * API, which is not trusted for writes), and the send is simulated before
   * the wallet prompt. The signer is resolved when this runs.
   */
  sendTransaction: (request: { to: Address; value: bigint }) => Promise<Hash>;
}

export interface TxApprovalStep {
  /**
   * One sentence shown while the wallet asks, explaining why this extra
   * prompt appears ("Lets the protocol move exactly 25 USDC for this
   * gesture."). Localized by the caller.
   */
  description: string;
  /** Resolves true when the approval is still needed. Omit to always ask. */
  isNeeded?: (ctx: TxContext) => Promise<boolean>;
  write: (ctx: TxContext) => Promise<Hash>;
}

export interface TxRunOptions {
  /**
   * Pre-flight checks and reads (balances, ownership, fresh prices). Runs
   * after the chain guard, before any wallet prompt. Return `false` to stop
   * quietly — show your own inline or toast message first.
   */
  prepare?: (ctx: TxContext) => Promise<boolean | void>;
  /** Approvals sent, and mined, before the main transaction. */
  approvals?: TxApprovalStep[];
  /** The main transaction. */
  write: (ctx: TxContext) => Promise<Hash>;
  /**
   * Success toast copy, or a builder that reads the receipt (event amounts…).
   * `null` (or a builder returning null) closes the lifecycle toast instead —
   * for flows that navigate to their own confirmation page.
   */
  successMessage:
    | string
    | ((receipt: TransactionReceipt) => string | null | Promise<string | null>)
    | null;
  /**
   * Action-specific fallback for failures the classifier cannot name, as a
   * cause-plus-next-step sentence ("Retrieve didn't go through. Check your
   * wallet and try again.").
   */
  failureMessage?: string;
  /**
   * Flow-specific copy for a failure (a price that moved, a balance
   * shortfall with amounts). Return null to fall back to the defaults.
   */
  describeError?: (err: unknown, info: TxErrorInfo) => string | null;
  /**
   * Runs after the receipt confirms and before the success toast. A throw
   * here (a follow-up read that hits a rate limit…) is reported and the flow
   * still ends `confirmed`, with a generic success toast: a mined transaction
   * is never shown as failed.
   */
  onConfirmed?: (receipt: TransactionReceipt, ctx: TxContext) => void | Promise<void>;
  /** Sentry context for unexpected failures. */
  errorContext?: string;
}

export type TxResult =
  | { status: 'confirmed'; hash: Hash; receipt: TransactionReceipt }
  | { status: 'failed'; error: TxErrorInfo; hash?: Hash }
  /**
   * Declined in the wallet (nothing sent), or replaced from the wallet after
   * sending: then `hash` is the mined replacement, which paid a network fee,
   * and `replaced` says it was a different transaction rather than the
   * wallet's "cancel".
   */
  | { status: 'cancelled'; hash?: Hash; replaced?: boolean }
  /** `prepare` returned false, or no wallet was connected. */
  | { status: 'aborted' }
  /** Another run of this flow is still in progress. */
  | { status: 'busy' };

export interface UseTxFlowResult {
  stage: TxStage;
  isBusy: boolean;
  run: (options: TxRunOptions) => Promise<TxResult>;
  /** Back to `idle` (e.g. when the form the flow belongs to is reset). */
  reset: () => void;
}

/** How long a confirmed-transaction toast stays up (ms). */
const SUCCESS_TOAST_MS = 8_000;
/** Receipt wait before the flow reports "still waiting" (ms). Arbitrum confirms in seconds. */
const RECEIPT_TIMEOUT_MS = 180_000;

let toastSequence = 0;

/* ────────────────────────────────────────────────────────────────── */
/*  Simulation                                                       */
/* ────────────────────────────────────────────────────────────────── */

/** The fields of a write request that the target check and the simulation read. */
interface WriteCall {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
}

/** A plain ETH send: no calldata, so it lands in the target's `receive()`. */
interface SendCall {
  to: Address;
  value: bigint;
}

interface SimulatingClient {
  simulateContract: (args: WriteCall & { account: Address }) => Promise<unknown>;
  call: (args: SendCall & { account: Address }) => Promise<unknown>;
}

/**
 * Runs a transaction as `eth_call` from the connected account before the
 * wallet prompt. A revert (with its custom error) or a balance that cannot
 * cover the value stops the flow here, so nothing is signed. Gas and fee
 * fields are left out on purpose: with a fee set, a node charges its whole
 * call gas cap against the balance and would refuse a wallet that can afford
 * the real transaction. When the simulation itself cannot run (the RPC is
 * down or rate limited), the transaction goes on and the wallet's own
 * estimate decides.
 */
async function simulate(dryRun: (() => Promise<unknown>) | null): Promise<void> {
  if (!dryRun) return;
  try {
    await dryRun();
  } catch (err) {
    const { kind } = classifyTxError(err);
    if (kind === 'would-revert' || kind === 'insufficient-funds') throw err;
    reportErrorThrottled(err, 'tx-simulate');
  }
}

/** Simulates a contract write (see {@link simulate}). */
function simulateWrite(client: unknown, call: WriteCall, account: Address): Promise<void> {
  const simulator = client as Partial<SimulatingClient>;
  const simulateContract = simulator.simulateContract?.bind(simulator);
  return simulate(
    simulateContract
      ? () =>
          simulateContract({
            address: call.address,
            abi: call.abi,
            functionName: call.functionName,
            ...(call.args ? { args: call.args } : {}),
            ...(call.value !== undefined ? { value: call.value } : {}),
            account,
          })
      : null,
  );
}

/** Simulates a plain ETH send (see {@link simulate}). */
function simulateSend(client: unknown, send: SendCall, account: Address): Promise<void> {
  const simulator = client as Partial<SimulatingClient>;
  const call = simulator.call?.bind(simulator);
  return simulate(call ? () => call({ to: send.to, value: send.value, account }) : null);
}

/* ────────────────────────────────────────────────────────────────── */
/*  Hook                                                             */
/* ────────────────────────────────────────────────────────────────── */

/**
 * One transaction lifecycle for every write in the app:
 *
 *   preparing → (switching-network) → approving i/n → awaiting-signature
 *     → pending(hash) → confirmed | failed | cancelled
 *
 * - Runs the chain guard first and resolves the signer at write time, so a
 *   wallet parked on another network is asked to switch instead of failing
 *   with a generic error.
 * - Drives ONE sonner toast by id through the stages ("Confirm in your
 *   wallet" → "Waiting for confirmation on Arbitrum One · View on Arbiscan"
 *   → success with the same link). Errors stay until dismissed and carry a
 *   "Copy details" action; the body is always a localized sentence, never
 *   raw provider text. A wallet rejection is a neutral "cancelled", not an
 *   error.
 * - Exposes `stage` so the trigger can read "Approve 1 of 2 in wallet…" /
 *   "Confirm in wallet…" / "Pending…" (see `useTxStageLabel`) and a `TxStatus`
 *   strip can sit under it.
 *
 * Pre-flight validation that belongs to the form (not enough CST, not the
 * NFT owner) stays in `prepare` and uses the caller's own messages.
 */
export function useTxFlow(): UseTxFlowResult {
  const t = useTranslations('toasts');
  const config = useConfig();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { address, chainId: walletChainId } = useConnection();
  const { mutateAsync: switchChainAsync } = useSwitchChain();
  const walletUi = useOptionalWalletUi();
  const { cosmicGame: apiGameAddress } = useContractAddresses();

  const [stage, setStage] = useState<TxStage>(IDLE_TX_STAGE);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // After an unmount the flow keeps going (the transaction is already in the
  // wallet or on-chain) and its toast keeps reporting; only the stage stops.
  const update = useCallback((next: TxStage) => {
    if (mountedRef.current) setStage(next);
  }, []);

  const reset = useCallback(() => update(IDLE_TX_STAGE), [update]);

  const explorerLink = useCallback(
    (hash: Hash) =>
      createElement(TxExplorerLink, {
        hash,
        label: t('tx.viewOnExplorer', { explorer: EXPLORER_NAME }),
      }),
    [t],
  );

  const describeFailure = useTxErrorMessage();

  const copyDetailsAction = useCallback(
    (details: string, toastId: string) => ({
      label: t('tx.copyDetails'),
      onClick: (event: { preventDefault: () => void }) => {
        // Keep the error on screen: sonner closes a toast after its action
        // unless the click's default is prevented.
        event.preventDefault();
        void navigator.clipboard
          ?.writeText(details)
          .then(() => toast.success(t('tx.detailsCopied'), { id: `${toastId}:copied` }))
          .catch(() => undefined);
      },
    }),
    [t],
  );

  const run = useCallback(
    async (options: TxRunOptions): Promise<TxResult> => {
      if (inFlightRef.current) {
        toast.info(t('tx.busy'));
        return { status: 'busy' };
      }
      const toastId = `tx-${++toastSequence}`;
      const errorContext = options.errorContext ?? 'tx-flow';

      if (!address) {
        update({ status: 'idle' });
        toast.error(t('tx.error.walletNotConnected'), {
          id: toastId,
          ...(walletUi
            ? {
                action: {
                  label: t('tx.connectWallet'),
                  onClick: () => walletUi.requestConnectModal(),
                },
              }
            : {}),
        });
        return { status: 'aborted' };
      }

      inFlightRef.current = true;
      // The hash a failure refers to: the approval or main transaction being
      // followed, never an earlier approval that already confirmed.
      let currentHash: Hash | undefined;
      let trustedTargets: Promise<ReadonlySet<string>> | null = null;
      // The protocol's contracts, read on-chain once per run.
      const trusted = (client: NonNullable<typeof publicClient>) =>
        (trustedTargets ??= readTrustedAddresses(
          client as unknown as ContractReader,
          activeChain.id,
          apiGameAddress,
        ));
      const ctx: TxContext = {
        account: address,
        writeContract: async (request) => {
          if (!publicClient) throw new TxClientUnavailableError();
          const call = request as unknown as WriteCall;
          assertTrustedWrite(call, await trusted(publicClient));
          await simulateWrite(publicClient, call, address);
          return writeContract(config, {
            ...request,
            chainId: activeChain.id,
          } as unknown as WriteContractParameters);
        },
        sendTransaction: async ({ to, value }) => {
          if (!publicClient) throw new TxClientUnavailableError();
          assertTrustedTarget(to, await trusted(publicClient));
          await simulateSend(publicClient, { to, value }, address);
          return sendTransaction(config, { to, value, chainId: activeChain.id });
        },
      };

      const waitForReceipt = async (
        client: NonNullable<typeof publicClient>,
        hash: Hash,
      ): Promise<TransactionReceipt> => {
        // A holder, not a `let`: the callback assigns it, which control-flow
        // narrowing cannot see.
        const replacedBy: { reason: 'cancelled' | 'replaced' | null } = { reason: null };
        const receipt = await client.waitForTransactionReceipt({
          hash,
          timeout: RECEIPT_TIMEOUT_MS,
          onReplaced: (replacement) => {
            // A speed-up in the wallet ('repriced') keeps the call and only
            // changes the fee: follow its hash so the explorer link stays
            // right. A wallet "cancel" mines a zero-value send to self, and
            // 'replaced' is a different transaction that reused the nonce:
            // either way this action was not recorded, and the replacement
            // paid a fee.
            if (replacement.reason !== 'repriced') replacedBy.reason = replacement.reason;
            currentHash = replacement.transaction.hash;
          },
        });
        if (replacedBy.reason) {
          throw new TxCancelledInWalletError(
            receipt.transactionHash ?? currentHash ?? hash,
            replacedBy.reason === 'replaced',
          );
        }
        if (receipt.status !== 'success') throw new TxRevertedError(receipt.transactionHash);
        return receipt;
      };

      /**
       * Success copy for a mined transaction. Everything from here on runs
       * after confirmation, so nothing may turn the outcome into a failure: a
       * throwing `onConfirmed` or copy builder is reported and the toast falls
       * back to a generic confirmation that suggests a refresh.
       */
      const confirmedMessage = async (receipt: TransactionReceipt): Promise<string | null> => {
        try {
          await options.onConfirmed?.(receipt, ctx);
          return typeof options.successMessage === 'function'
            ? await options.successMessage(receipt)
            : options.successMessage;
        } catch (postConfirmErr) {
          reportError(postConfirmErr, `${errorContext}-post-confirm`);
          return t('tx.confirmedRefresh');
        }
      };

      try {
        update({ status: 'preparing' });
        // Checked before any wallet prompt: without a client for the
        // protocol's chain the flow could send but never follow the result.
        if (!publicClient) throw new TxClientUnavailableError();

        const chainStatus = await ensureWalletOnRequiredChain(config, {
          fallbackChainId: walletChainId ?? null,
          switchTo: async (chainId) => {
            update({ status: 'switching-network' });
            toast.loading(t('tx.stage.switchNetwork', { network: REQUIRED_CHAIN_NAME }), {
              id: toastId,
              description: t('tx.stage.switchNetworkHint', { network: REQUIRED_CHAIN_NAME }),
            });
            await switchChainAsync({ chainId });
          },
        });
        if (chainStatus !== 'ok') throw new ChainGuardError(chainStatus);

        update({ status: 'preparing' });
        if (options.prepare && (await options.prepare(ctx)) === false) {
          toast.dismiss(toastId);
          update({ status: 'idle' });
          return { status: 'aborted' };
        }

        const approvals: TxApprovalStep[] = [];
        for (const approval of options.approvals ?? []) {
          if (!approval.isNeeded || (await approval.isNeeded(ctx))) approvals.push(approval);
        }
        const total = approvals.length + 1;

        for (const [index, approval] of approvals.entries()) {
          const step = index + 1;
          update({ status: 'approving', step, total, phase: 'signature' });
          toast.loading(t('tx.stage.approve', { step, total }), {
            id: toastId,
            description: approval.description,
          });
          const approvalHash = await approval.write(ctx);
          currentHash = approvalHash;
          update({ status: 'approving', step, total, phase: 'pending', hash: approvalHash });
          toast.loading(t('tx.stage.approvalPending', { step, total }), {
            id: toastId,
            description: explorerLink(approvalHash),
          });
          await waitForReceipt(publicClient, approvalHash);
          // Confirmed: a later failure (the main write refused before it is
          // sent) must not be reported against this approval's hash.
          currentHash = undefined;
        }

        update({ status: 'awaiting-signature', step: total, total });
        toast.loading(
          total > 1 ? t('tx.stage.confirmStep', { step: total, total }) : t('tx.stage.confirm'),
          { id: toastId, description: t('tx.stage.confirmHint') },
        );
        const hash = await options.write(ctx);
        currentHash = hash;
        update({ status: 'pending', hash });
        toast.loading(t('tx.stage.pending', { network: REQUIRED_CHAIN_NAME }), {
          id: toastId,
          description: explorerLink(hash),
        });

        const receipt = await waitForReceipt(publicClient, hash);
        const finalHash = receipt.transactionHash ?? currentHash ?? hash;
        update({ status: 'confirmed', hash: finalHash });

        const success = await confirmedMessage(receipt);
        if (success) {
          toast.success(success, {
            id: toastId,
            description: explorerLink(finalHash),
            duration: SUCCESS_TOAST_MS,
          });
        } else {
          toast.dismiss(toastId);
        }
        return { status: 'confirmed', hash: finalHash, receipt };
      } catch (err) {
        const classified = classifyTxError(err);
        if (classified.kind === 'rejected') {
          update({ status: 'cancelled' });
          toast.info(t('walletTransactionCancelled'), { id: toastId });
          return { status: 'cancelled' };
        }
        if (err instanceof TxCancelledInWalletError) {
          const replacementHash = err.hash as Hash;
          const replaced = err.replaced ? { replaced: true } : {};
          update({ status: 'cancelled', hash: replacementHash, ...replaced });
          toast.info(
            t(err.replaced ? 'tx.status.replacedInWallet' : 'tx.status.cancelledInWallet'),
            {
              id: toastId,
              description: explorerLink(replacementHash),
              duration: SUCCESS_TOAST_MS,
            },
          );
          return { status: 'cancelled', hash: replacementHash, ...replaced };
        }

        reportError(err, errorContext);
        // "Copy details" carries the decoded custom error and its arguments.
        const info: TxErrorInfo = {
          ...classified,
          contractErrorName: classified.contractErrorName ?? contractErrorNameOf(err),
          details: withDecodedContractError(classified.details, err),
        };
        const descriptor = getContractErrorDescriptor(err);
        const message =
          options.describeError?.(err, info) ??
          (descriptor ? t(descriptor.key, descriptor.values) : null) ??
          describeFailure(info, options.failureMessage);
        update({
          status: 'failed',
          error: info,
          message,
          ...(currentHash ? { hash: currentHash } : {}),
        });
        toast.error(message, {
          id: toastId,
          duration: Number.POSITIVE_INFINITY,
          ...(currentHash ? { description: explorerLink(currentHash) } : {}),
          action: copyDetailsAction(info.details, toastId),
        });
        return { status: 'failed', error: info, ...(currentHash ? { hash: currentHash } : {}) };
      } finally {
        inFlightRef.current = false;
      }
    },
    [
      address,
      apiGameAddress,
      config,
      copyDetailsAction,
      explorerLink,
      describeFailure,
      publicClient,
      switchChainAsync,
      t,
      update,
      walletChainId,
      walletUi,
    ],
  );

  return useMemo(() => ({ stage, isBusy: isTxBusy(stage), run, reset }), [reset, run, stage]);
}
