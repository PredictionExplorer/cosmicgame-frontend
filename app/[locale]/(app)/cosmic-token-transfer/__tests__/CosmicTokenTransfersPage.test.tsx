import { render, screen } from '@/test-utils';

import CosmicTokenTransfersPage from '../[address]/CosmicTokenTransfersPage';

jest.mock('@/components/tokens/AddressTransferHistory', () => ({
  AddressTransferHistory: ({ asset, address }: { asset: string; address: string }) => (
    <div data-testid="history" data-asset={asset} data-address={address} />
  ),
}));

describe('CosmicTokenTransfersPage', () => {
  it("renders the address's CST history", () => {
    render(<CosmicTokenTransfersPage address="0xabc" />);

    const history = screen.getByTestId('history');
    expect(history).toHaveAttribute('data-asset', 'cst');
    expect(history).toHaveAttribute('data-address', '0xabc');
  });
});
