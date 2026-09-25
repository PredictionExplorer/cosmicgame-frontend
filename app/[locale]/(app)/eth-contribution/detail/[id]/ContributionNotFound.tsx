import { getTranslations } from 'next-intl/server';

import { PageMessages } from '@/components/i18n/PageMessages';
import { PageHeader } from '@/components/layout/PageHeader';
import { LedgerPage } from '@/components/ledger/LedgerPage';

import { MissingContribution } from './MissingContribution';

/**
 * A contribution record the API does not hold: the page's own header (the
 * trail back to the ledger, the not-found title) over the state that says
 * which records have a page and leads back to the list.
 *
 * The page renders it on the server, in place of `notFound()`: a segment's
 * `notFound()` reaches the browser as Next.js's bare error shell, blank
 * without script. So it answers 200 with `noindex` (the page's metadata
 * names it too), as a streamed 404 does, and the cached render is kept a
 * minute, since the record may be indexed a moment from now.
 */
export async function ContributionNotFound({ locale, id }: { locale: string; id: number }) {
  const t = await getTranslations({ locale, namespace: 'ethContribution.detail' });
  return (
    <PageMessages namespaces={['ethContribution']}>
      <LedgerPage
        header={
          <PageHeader
            section="records"
            breadcrumbs={[{ label: t('breadcrumbContributions'), href: '/eth-contribution' }]}
            title={t('notFoundHeading')}
          />
        }
      >
        <MissingContribution id={id} />
      </LedgerPage>
    </PageMessages>
  );
}
