'use client';

import { AddressTransferHistory } from '@/components/tokens/AddressTransferHistory';

/** One address's Cosmic Signature NFT transfers: imprinted, received and sent, with its counts. */
const CosmicSignatureTransfersPage = ({ address }: { address: string }) => (
  <AddressTransferHistory asset="nft" address={address} />
);

export default CosmicSignatureTransfersPage;
