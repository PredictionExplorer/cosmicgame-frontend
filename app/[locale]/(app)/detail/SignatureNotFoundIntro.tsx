'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { PendingPlate } from '@/components/ui/art-frame';

import { parseTokenId } from './[id]/tokenId';

/**
 * The top of a Signature's not-found page: an empty plate on the wall where
 * the work would hang, captioned with the number that was asked for
 * (#000060, in the identifier face), and a heading that says it has not been
 * imprinted yet, or that the link leads nowhere when it holds no token
 * number. The number comes from the URL, which the not-found boundary does
 * not receive as a prop.
 */
export function SignatureNotFoundIntro() {
  const t = useTranslations('detail');
  const { id } = useParams<{ id?: string }>();
  const tokenId = typeof id === 'string' ? parseTokenId(id) : null;
  const number = tokenId === null ? null : formatId(tokenId);

  return (
    <>
      {/* Decorative: the heading below says what the empty plate means. */}
      <PendingPlate detail={number ?? undefined} className="mx-auto max-w-72 sm:max-w-sm" />
      <h1 id="signature-not-found-heading" className="mt-8 type-display-sm text-balance">
        {number === null ? t('notFound.titleInvalid') : t('notFound.title')}
      </h1>
    </>
  );
}
