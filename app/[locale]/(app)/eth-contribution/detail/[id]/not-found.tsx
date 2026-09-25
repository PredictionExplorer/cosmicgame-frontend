import { getTranslations } from 'next-intl/server';

import { PageMessages } from '@/components/i18n/PageMessages';
import { PageHeader } from '@/components/layout/PageHeader';
import { LedgerPage } from '@/components/ledger/LedgerPage';

import { MissingContribution } from './MissingContribution';

/** "Page not found" in the tab and `noindex, follow`, as every app 404. */
export { generateNotFoundMetadata as generateMetadata } from '@/components/layout/notFoundMetadata';

/**
 * A contribution record that does not exist, answered with a 404: the page's
 * own header (the trail back to the ledger, the not-found title) over the
 * state that says which records have a page and leads back to the list.
 */
export default async function ContributionNotFound() {
  const t = await getTranslations('ethContribution.detail');
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
        <MissingContribution />
      </LedgerPage>
    </PageMessages>
  );
}
