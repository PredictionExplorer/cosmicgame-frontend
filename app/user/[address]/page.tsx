import type { Metadata } from 'next';
import { getAddress, isAddress } from 'viem';
import axios from 'axios';

import { cosmicGameBaseUrl } from '@/services/api';
import { createMetadata } from '@/utils/seo';

import UserPage from './UserPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address: rawAddress } = await params;
  let address = rawAddress;

  if (isAddress(address.toLowerCase())) {
    address = getAddress(address.toLowerCase());
    try {
      const { data } = await axios.get(`${cosmicGameBaseUrl}user/info/${address}`);
      if (!data || !data.Bids?.length) {
        address = 'Invalid Address';
      }
    } catch {
      address = 'Invalid Address';
    }
  } else {
    address = 'Invalid Address';
  }

  const title = `Information for User ${address} | Cosmic Signature`;
  const description = `Information for User ${address}`;

  return createMetadata(title, description, undefined, '/user/' + rawAddress);
}

export default async function Page({ params }: { params: Promise<{ address: string }> }) {
  const { address: rawAddress } = await params;
  let address = rawAddress;

  if (isAddress(address.toLowerCase())) {
    address = getAddress(address.toLowerCase());
  } else {
    address = 'Invalid Address';
  }

  return <UserPage address={address} />;
}
