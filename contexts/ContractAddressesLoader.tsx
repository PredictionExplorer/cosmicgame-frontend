'use client';

import { useEffect, useMemo } from 'react';

import { publishDashboardContractAddresses, type AppContractAddresses } from '@/config/networks';
import { useDashboardInfo } from '@/hooks/useApiQuery';

import { mergeContractAddresses } from './ContractAddressesContext';

/**
 * Reads the contract addresses from the dashboard for ContractAddressesProvider,
 * which loads this module the first time a component asks for an address.
 * The addresses do not change while a deployment runs, so this read does not
 * poll; pages that show live dashboard figures poll the same query themselves.
 */
export default function ContractAddressesLoader({
  onAddresses,
}: {
  onAddresses: (addresses: AppContractAddresses) => void;
}) {
  const { data } = useDashboardInfo(undefined, { poll: false });
  const addresses = useMemo(
    () => mergeContractAddresses(data?.ContractAddrs),
    [data?.ContractAddrs],
  );

  useEffect(() => {
    publishDashboardContractAddresses(addresses);
    onAddresses(addresses);
  }, [addresses, onAddresses]);

  return null;
}
