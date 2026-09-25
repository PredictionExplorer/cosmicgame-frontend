'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { PageHeader, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { useParticipantTrail } from '@/components/layout/participantTrail';
import { AddressChip } from '@/components/ui/address-chip';
import { Term } from '@/components/ui/term';

export type StellarSelectionKind = 'eth' | 'nft';

const GROUP: Record<StellarSelectionKind, 'stellarSelectionEth' | 'stellarSelectionNft'> = {
  eth: 'stellarSelectionEth',
  nft: 'stellarSelectionNft',
};

const SIBLING: Record<StellarSelectionKind, StellarSelectionKind> = { eth: 'nft', nft: 'eth' };

/** The FAQ answer that explains Stellar Selection. */
export const STELLAR_SELECTION_FAQ_HREF = '/faq#how-does-the-stellarSelection-work';

interface StellarSelectionHeaderProps {
  kind: StellarSelectionKind;
  /** The participant, checksummed. */
  address: string;
  figures?: readonly PageHeaderFigure[];
  /**
   * Nothing selected yet: the page's empty state offers the sibling page and "How Stellar
   * Selection works", so the header leaves its related pages out rather than show them twice.
   */
  empty?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
}

/**
 * The header of a participant's Stellar Selection pages: the trail back to
 * the participant, a short title, one sentence with the explained term, the
 * totals, the participant's address (copyable, linked to the profile) and
 * the related pages: the sibling page and how selection works. The profile
 * is linked twice already (the trail and the address), so not a third time.
 */
export function StellarSelectionHeader({
  kind,
  address,
  figures,
  empty = false,
  actions,
  children,
}: StellarSelectionHeaderProps) {
  const t = useTranslations('statistics');
  const trail = useParticipantTrail(address);
  const group = GROUP[kind];
  const sibling = SIBLING[kind];

  return (
    <PageHeader
      section="explore"
      breadcrumbs={trail}
      title={t(`${group}.heading`)}
      subtitle={t.rich(`${group}.lede`, {
        term: (chunks) => <Term id="stellarSelection">{chunks}</Term>,
      })}
      figures={figures}
      meta={
        <span className="inline-flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span>{t('stellarSelectionPages.participant')}</span>
          <AddressChip address={address} display="responsive" />
        </span>
      }
      // The empty state offers the sibling page and how selection works itself.
      related={
        empty
          ? undefined
          : [
              {
                href: `/user/stellar-selection-${sibling}/${address}`,
                label: t(`${GROUP[sibling]}.heading`),
              },
              { href: STELLAR_SELECTION_FAQ_HREF, label: t('stellarSelectionPages.howItWorks') },
            ]
      }
      actions={actions}
    >
      {children}
    </PageHeader>
  );
}

/**
 * What a Stellar Selection page shows for a link whose address is not an
 * address: the reason and how to fix it; the trail leads back to the
 * participants.
 */
export function InvalidParticipantState() {
  const t = useTranslations('statistics');
  const trail = useParticipantTrail(null);
  return (
    <PageHeader
      section="explore"
      breadcrumbs={trail}
      title={t('stellarSelectionPages.invalidTitle')}
      subtitle={t('stellarSelectionPages.invalidDescription')}
    />
  );
}
