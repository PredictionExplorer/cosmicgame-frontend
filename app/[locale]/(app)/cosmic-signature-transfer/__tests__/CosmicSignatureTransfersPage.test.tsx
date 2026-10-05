import { render, screen } from '@/test-utils';

import CosmicSignatureTransfersPage from '../[address]/CosmicSignatureTransfersPage';

jest.mock('@/components/tokens/AddressTransferHistory', () => ({
  AddressTransferHistory: ({ asset, address }: { asset: string; address: string }) => (
    <div data-testid="history" data-asset={asset} data-address={address} />
  ),
}));

describe('CosmicSignatureTransfersPage', () => {
  it("renders the address's NFT history", () => {
    render(<CosmicSignatureTransfersPage address="0xabc" />);

    const history = screen.getByTestId('history');
    expect(history).toHaveAttribute('data-asset', 'nft');
    expect(history).toHaveAttribute('data-address', '0xabc');
  });
});
