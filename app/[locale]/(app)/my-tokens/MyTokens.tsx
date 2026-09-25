'use client';

import { useId, useState, useMemo, type ReactNode } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { isAnchorable } from '@/utils/anchoringStats';
import { formatCount } from '@/utils/format';
import { useCSTTokensByUser } from '@/hooks/useApiQuery';
import { useCollectionTraits } from '@/hooks/useNftTraits';
import { useActiveWeb3React } from '@/hooks/web3';
import { Link } from '@/i18n/navigation';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { PageHeader } from '@/components/layout/PageHeader';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { CosmicSignatureNftTransferForm } from '@/components/nft/CosmicSignatureNftTransferForm';
import { SignatureWall, type SignatureWallItem } from '@/components/nft/SignatureWall';
import { useTraitLabels } from '@/components/nft/traits';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';

/**
 * My NFTs: the Signatures in the connected wallet, hung as a personal
 * collection (the art on its plates, how each one arrived in its caption),
 * with sending them to another wallet one quiet disclosure below. While a
 * Signature here has never been anchored, the header offers to anchor it.
 */
export default function MyTokens() {
  const t = useTranslations('myPages');
  const tWallet = useTranslations('wallet');
  const locale = useLocale();
  const { valueLabel } = useTraitLabels();
  const { account, active } = useActiveWeb3React();
  const connected = Boolean(active && account);
  const {
    data: tokensRaw,
    isLoading,
    isError,
    refetch,
  } = useCSTTokensByUser(connected ? account : undefined);
  const {
    traits: collectionTraits,
    isLoading: traitsLoading,
    isError: traitsError,
  } = useCollectionTraits();
  const traitsForUi = traitsError ? null : traitsLoading ? undefined : (collectionTraits ?? null);
  const tokens = useMemo(() => tokensRaw ?? [], [tokensRaw]);

  const items = useMemo<SignatureWallItem[]>(
    () =>
      [...tokens]
        .sort((a, b) => b.TokenId - a.TokenId)
        .map((token) => {
          const allocation = collectionTraits?.byId.get(token.TokenId)?.allocation;
          return {
            tokenId: token.TokenId,
            seed: token.Seed,
            name: token.TokenName,
            anchored: Boolean(token.Staked),
            imprintedAt: token.MintTimeStamp ?? token.TimeStamp,
            // How the Signature first arrived: Stellar Selection, the Final Gesture…
            extraMeta: allocation ? [valueLabel('allocation', allocation)] : undefined,
          };
        }),
    [tokens, collectionTraits, valueLabel],
  );

  const loaded = connected && !isLoading && !isError;
  const anchoredCount = tokens.filter((token) => token.Staked).length;
  // The anchoring rule: not anchored now, and never released (each NFT is anchored once, ever).
  const anchorableCount = tokens.filter(isAnchorable).length;

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        section="account"
        title={t('tokens.page.title')}
        subtitle={t('tokens.page.subtitle')}
        actions={
          <>
            {loaded && anchorableCount > 0 ? (
              <Link href="/my-anchors" className={buttonVariants({ variant: 'outline' })}>
                <AnchoringIcon aria-hidden />
                {t('tokens.page.anchorLink')}
              </Link>
            ) : null}
            <NftMarketplaceButton variant="secondary" label={t('tokens.page.marketplace')} />
          </>
        }
        figures={
          loaded && tokens.length > 0
            ? [
                {
                  id: 'owned',
                  label: t('tokens.page.figures.owned'),
                  value: formatCount(tokens.length, locale),
                },
                {
                  id: 'anchored',
                  label: t('tokens.page.figures.anchored'),
                  value: formatCount(anchoredCount, locale),
                },
              ]
            : undefined
        }
      />

      {!connected ? (
        <WalletRequiredState
          title={tWallet('required.nfts.title')}
          description={tWallet('required.nfts.description')}
          publicLink={{ href: '/gallery', label: tWallet('required.nfts.publicLink') }}
        />
      ) : isError ? (
        <ErrorState
          title={t('tokens.page.loadErrorTitle')}
          message={t('tokens.page.loadErrorMessage')}
          headingLevel={2}
          onRetry={() => void refetch()}
        />
      ) : !isLoading && tokens.length === 0 ? (
        <EmptyState
          title={t('tokens.page.emptyTitle')}
          description={t('tokens.page.emptyDescription')}
          headingLevel={2}
          variant="page"
          action={
            <Link href="/gallery" className={buttonVariants({ variant: 'outline' })}>
              {tWallet('required.nfts.publicLink')}
              <ArrowRight aria-hidden />
            </Link>
          }
        />
      ) : (
        <>
          <SignatureWall
            items={items}
            collectionTraits={traitsForUi}
            loading={isLoading}
            ariaLabel={t('tokens.page.ownedTitle')}
          />

          {loaded && account ? (
            <TransferSection
              title={t('tokens.page.transferTitle')}
              subtitle={t('tokens.page.transferSubtitle')}
            >
              <CosmicSignatureNftTransferForm
                sourceAddress={account}
                tokens={tokens}
                historyHref={`/cosmic-signature-transfer/${account}`}
              />
            </TransferSection>
          ) : null}
        </>
      )}
    </PageShell>
  );
}

/**
 * Sending NFTs, one quiet disclosure under the collection: an h2 whose
 * button shows and hides the form (collapsed until asked for).
 */
function TransferSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <section className="mt-16 border-t border-rule-faint pt-2 sm:mt-20">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-center justify-between gap-4 rounded-control py-4 text-start"
        >
          <span className="flex flex-col gap-1">
            <span className="type-heading-3 text-foreground">{title}</span>
            <span className="type-body-sm text-muted-foreground">{subtitle}</span>
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              'size-5 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] group-hover:text-foreground',
              open && 'rotate-180',
            )}
          />
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="pb-2 pt-2">
        {open ? children : null}
      </div>
    </section>
  );
}
