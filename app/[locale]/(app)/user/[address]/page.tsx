import type { Metadata } from 'next';
import { getAddress, isAddress } from 'viem';
import axios from 'axios';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAPIUrl } from '@/services/api';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import UserPage from './UserPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: string }>;
}): Promise<Metadata> {
  const { locale, address: rawAddress } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  let address = rawAddress;

  if (isAddress(address.toLowerCase())) {
    address = getAddress(address.toLowerCase());
    try {
      const { data } = await axios.get(getAPIUrl(`user/info/${address}`));
      if (!data || !data.Gestures?.length) {
        address = t('userProfile.invalidAddress');
      }
    } catch {
      address = t('userProfile.invalidAddress');
    }
  } else {
    address = t('userProfile.invalidAddress');
  }

  const title = t('userProfile.title', { address });
  const description = t('userProfile.description', { address });

  return createMetadata(title, description, undefined, '/user/' + rawAddress, {
    index: false,
    locale,
  });
}

// Dynamic-param pages render on demand; revalidate keeps live protocol data
// fresh instead of freezing the first render forever (see route-group refactor).
export const revalidate = 300;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; address: string }>;
}) {
  const { locale, address: rawAddress } = await params;
  setRequestLocale(locale);
  let address = rawAddress;

  if (isAddress(address.toLowerCase())) {
    address = getAddress(address.toLowerCase());
  } else {
    address = 'Invalid Address';
  }

  return (
    <PageMessages namespaces={['anchoring', 'detail', 'marketing', 'myPages', 'tables']}>
      <UserPage address={address} />
    </PageMessages>
  );
}
