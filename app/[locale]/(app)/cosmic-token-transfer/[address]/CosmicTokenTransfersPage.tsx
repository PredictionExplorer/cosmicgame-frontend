'use client';

import { AddressTransferHistory } from '@/components/tokens/AddressTransferHistory';

/** One address's CST transfers: imprinted, received, sent and consumed, with its totals. */
const CosmicTokenTransfersPage = ({ address }: { address: string }) => (
  <AddressTransferHistory asset="cst" address={address} />
);

export default CosmicTokenTransfersPage;
