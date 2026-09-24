'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

import { cosmicSignatureAbi } from '@/contracts/abis';

import { AnchoringIcon } from '@/lib/conceptIcons';
import { Link } from '@/i18n/navigation';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useAnchorActions } from '@/hooks/useAnchorActions';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { formatId } from '@/utils/format';
import { RecipientField } from '@/components/tokens/transfer/RecipientField';
import { TransferReview, transferGate } from '@/components/tokens/transfer/TransferReview';
import { parseRecipient } from '@/components/tokens/transfer/recipient';
import { useRecipientFacts } from '@/components/tokens/transfer/useRecipientFacts';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

import { NFT_NAME_MAX_BYTES, truncateToBytes } from './nftName';

export interface NFTOwnerActionsProps {
  tokenId: number;
  /** The connected wallet that owns the token: the transfer's sender. */
  owner: Address;
  /** The token's current name ('' when it has none). */
  currentName: string;
  /** How many tokens carry a name, for the pointer to the Named NFTs page. */
  totalNamedTokens: number | null;
  /**
   * The token has never been anchored (the ledger's "Eligible for
   * Anchoring"): the card offers to anchor it here, not only on /anchoring.
   */
  anchoringEligible?: boolean;
  /** After a confirmed anchor: the token is now anchored, so refresh it. */
  onAnchored?: () => void | Promise<unknown>;
  showMetaMaskAction: boolean;
  addingToMetaMask: boolean;
  onAddToMetaMask: () => void;
  /** After a confirmed transfer: the token has a new owner, so refresh it. */
  onTransferred: () => void | Promise<unknown>;
  /** After a confirmed rename or clear. */
  onRenamed: () => void | Promise<unknown>;
}

type Pending = 'transfer' | 'name' | 'clear' | null;

/**
 * The owner's tools beside the Signature: anchor it while it never has been,
 * name it (or clear its name), and send it to another wallet. The transfer is irreversible, so it checks the
 * recipient on-chain as it is typed and reviews what leaves and where before
 * the wallet opens, with an acknowledgement for a new, contract or protocol
 * address. Every write runs through `useTxFlow` (chain guard, wallet prompt,
 * pending, confirmed), and only the button that started it spins.
 */
export function NFTOwnerActions({
  tokenId,
  owner,
  currentName,
  totalNamedTokens,
  anchoringEligible = false,
  onAnchored,
  showMetaMaskAction,
  addingToMetaMask,
  onAddToMetaMask,
  onTransferred,
  onRenamed,
}: NFTOwnerActionsProps) {
  const t = useTranslations('detail.ownerActions');
  const tToasts = useTranslations('toasts');
  const tReview = useTranslations('forms.transfer.review');
  const headingId = useId();
  const { cosmicSignature } = useContractAddresses();
  const { notify } = useNotify();
  const { run, stage, isBusy } = useTxFlow();
  const stageLabel = useTxStageLabel();
  const [pending, setPending] = useState<Pending>(null);
  const { anchor, txStage: anchorStage } = useAnchorActions();
  const [anchoring, setAnchoring] = useState(false);

  const [name, setName] = useState('');
  const [recipientText, setRecipientText] = useState('');
  const [recipientTouched, setRecipientTouched] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgementMissing, setAcknowledgementMissing] = useState(false);
  const recipientRef = useRef<HTMLInputElement>(null);
  const acknowledgementRef = useRef<HTMLInputElement>(null);

  const recipient = parseRecipient(recipientText, { from: owner });
  const check = useRecipientFacts(recipient.address);
  const gate = transferGate(check, acknowledged);
  const checkingRecipient = !isBusy && recipient.address !== null && gate === 'checking';
  const id = formatId(tokenId);
  const named = currentName.trim() !== '';

  /** Runs one write, marking which button it belongs to. */
  const write = async (
    kind: Exclude<Pending, null>,
    options: {
      functionName: 'transferFrom' | 'setNftName';
      args: (ctxAccount: Address) => readonly unknown[];
      successMessage: string;
      failureMessage: string;
      onConfirmed: () => void | Promise<unknown>;
    },
  ) => {
    if (!cosmicSignature) {
      notify('error', tToasts('transfer.nft.contractUnavailable'));
      return;
    }
    setPending(kind);
    try {
      await run({
        write: (ctx) =>
          ctx.writeContract({
            address: cosmicSignature as Address,
            abi: cosmicSignatureAbi,
            functionName: options.functionName,
            args: options.args(ctx.account),
          }),
        successMessage: options.successMessage,
        failureMessage: options.failureMessage,
        errorContext: kind === 'transfer' ? 'nft-transfer' : 'nft-name',
        onConfirmed: async () => {
          await options.onConfirmed();
        },
      });
    } finally {
      setPending(null);
    }
  };

  const submitName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = name.trim();
    if (!next) return;
    await write('name', {
      functionName: 'setNftName',
      args: () => [BigInt(tokenId), next],
      successMessage: tToasts('transfer.nft.nameSet'),
      failureMessage: tToasts('transfer.nft.nameSetFailed'),
      onConfirmed: () => {
        setName('');
        return onRenamed();
      },
    });
  };

  const clearName = () =>
    write('clear', {
      functionName: 'setNftName',
      args: () => [BigInt(tokenId), ''],
      successMessage: tToasts('transfer.nft.nameCleared'),
      failureMessage: tToasts('transfer.nft.nameClearFailed'),
      onConfirmed: onRenamed,
    });

  const submitTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecipientTouched(true);
    if (recipient.error || !recipient.address) {
      recipientRef.current?.focus();
      return;
    }
    // Never race the recipient check: its answer decides whether the send
    // needs an acknowledgement. The button says it is checking meanwhile.
    if (gate === 'checking') return;
    if (gate === 'acknowledge') {
      setAcknowledgementMissing(true);
      acknowledgementRef.current?.focus();
      return;
    }
    const to = recipient.address;
    await write('transfer', {
      functionName: 'transferFrom',
      args: (from) => [from, to, BigInt(tokenId)],
      successMessage: tToasts('transfer.nft.detailTransferConfirmed'),
      failureMessage: tToasts('transfer.nft.failedToken', { tokenId: id }),
      onConfirmed: () => {
        setRecipientText('');
        setRecipientTouched(false);
        setAcknowledged(false);
        return onTransferred();
      },
    });
  };

  const busyLabel = (kind: Exclude<Pending, null>) =>
    pending === kind ? (stageLabel(stage) ?? undefined) : undefined;

  /** Anchors this token (the approval first, when the collection has none). */
  const anchorToken = async () => {
    setAnchoring(true);
    try {
      const result = await anchor(tokenId, false);
      if (result.status === 'confirmed') await onAnchored?.();
    } finally {
      setAnchoring(false);
    }
  };
  const busy = isBusy || anchoring;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="owner-actions"
      className="rounded-surface bg-surface p-5"
    >
      <h2 id={headingId} className="type-title text-foreground">
        {t('title')}
      </h2>

      {anchoringEligible ? (
        <div className="mt-4 flex flex-col gap-3 rounded-control bg-surface-sunken p-4">
          <p className="type-body-sm text-muted-foreground">{t('anchor.note')}</p>
          <ChainGuard requireConnection buttonClassName="w-full">
            <Button
              type="button"
              variant="secondary"
              loading={anchoring}
              disabled={busy && !anchoring}
              onClick={() => void anchorToken()}
              className="w-full"
            >
              <AnchoringIcon aria-hidden />
              {(anchoring ? stageLabel(anchorStage) : null) ?? t('anchor.button', { id })}
            </Button>
          </ChainGuard>
          {anchoring ? <TxStatus stage={anchorStage} /> : null}
        </div>
      ) : null}

      <Tabs defaultValue="name" className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="name" className="flex-1">
            {t('tabs.name')}
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex-1">
            {t('tabs.transfer')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="name" className="mt-5">
          <form noValidate onSubmit={submitName} className="flex flex-col gap-4">
            <FormField label={t('nameLabel')} hint={t('nameHint', { max: NFT_NAME_MAX_BYTES })}>
              {(control) => (
                <Input
                  {...control}
                  value={name}
                  placeholder={currentName || t('namePlaceholder')}
                  autoComplete="off"
                  disabled={busy}
                  onChange={(event) => setName(truncateToBytes(event.target.value))}
                />
              )}
            </FormField>
            <ChainGuard requireConnection buttonClassName="w-full">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  variant="secondary"
                  loading={pending === 'name'}
                  disabled={!name.trim() || (busy && pending !== 'name')}
                  className="flex-1"
                >
                  {busyLabel('name') ?? (named ? t('changeName') : t('setName'))}
                </Button>
                {named ? (
                  <Button
                    type="button"
                    variant="outline"
                    loading={pending === 'clear'}
                    disabled={busy && pending !== 'clear'}
                    onClick={() => void clearName()}
                  >
                    {busyLabel('clear') ?? t('clearName')}
                  </Button>
                ) : null}
              </div>
            </ChainGuard>
            {pending === 'name' || pending === 'clear' ? <TxStatus stage={stage} /> : null}
            {totalNamedTokens !== null ? (
              <p className="type-caption text-subtle">
                {t('namedTokensCount', { count: totalNamedTokens })}{' '}
                <Link
                  href="/named-nfts"
                  className="link-quiet inline-flex items-center gap-1 text-muted-foreground"
                >
                  {t('viewAllNamedTokens')}
                  <ArrowRight aria-hidden className="size-3.5 text-subtle" />
                </Link>
              </p>
            ) : null}
          </form>
        </TabsContent>

        <TabsContent value="transfer" className="mt-5">
          <form noValidate onSubmit={submitTransfer} className="flex flex-col gap-4">
            <RecipientField
              inputRef={recipientRef}
              value={recipientText}
              onChange={(value) => {
                setRecipientText(value);
                setAcknowledged(false);
                setAcknowledgementMissing(false);
              }}
              onBlur={() => setRecipientTouched(true)}
              error={recipientTouched ? recipient.error : null}
              check={check}
              reviewShown={recipient.address !== null}
              disabled={busy}
            />
            {recipient.address ? (
              <TransferReview
                sending={<span className="type-mono">{id}</span>}
                recipient={recipient.address}
                check={check}
                acknowledged={acknowledged}
                onAcknowledgedChange={(next) => {
                  setAcknowledged(next);
                  if (next) setAcknowledgementMissing(false);
                }}
                acknowledgementMissing={acknowledgementMissing}
                acknowledgementRef={acknowledgementRef}
              />
            ) : null}
            <ChainGuard requireConnection buttonClassName="w-full">
              <Button
                type="submit"
                loading={pending === 'transfer' || checkingRecipient}
                disabled={busy && pending !== 'transfer'}
                className="w-full"
              >
                {busyLabel('transfer') ??
                  (checkingRecipient ? tReview('checking') : t('transferButton', { id }))}
              </Button>
            </ChainGuard>
            {pending === 'transfer' ? <TxStatus stage={stage} /> : null}
          </form>
        </TabsContent>
      </Tabs>

      {showMetaMaskAction ? (
        <div className="mt-5 flex items-center gap-1 border-t border-rule-faint pt-4">
          <Button
            variant="quiet"
            size="sm"
            onClick={onAddToMetaMask}
            loading={addingToMetaMask}
            className="-ms-2"
          >
            <CirclePlus aria-hidden />
            {addingToMetaMask ? t('addingToMetaMask') : t('addToMetaMask')}
          </Button>
          <InfoTooltip content={t('metaMaskTooltip')} label={t('addToMetaMask')} />
        </div>
      ) : null}
    </section>
  );
}
