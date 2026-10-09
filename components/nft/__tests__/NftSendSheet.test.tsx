import { render, screen, within } from '@/test-utils';

import { NftSendSheet } from '../NftSendSheet';

// The form talks to the wallet; its own suite covers it.
jest.mock('../CosmicSignatureNftTransferForm', () => ({
  CosmicSignatureNftTransferForm: ({ tokenIds }: { tokenIds: number[] }) => (
    <div data-testid="nft-transfer-form" data-ids={tokenIds.join(',')} />
  ),
}));

const SOURCE = '0x1111111111111111111111111111111111111111';

function renderSheet(count: number) {
  const items = Array.from({ length: count }, (_, index) => ({
    tokenId: index + 1,
    seed: `a${index + 1}`,
  }));
  return render(
    <NftSendSheet
      open
      onOpenChange={jest.fn()}
      sourceAddress={SOURCE}
      items={items}
      onSent={jest.fn()}
      onComplete={jest.fn()}
    />,
  );
}

describe('NftSendSheet', () => {
  it('titles the send by its count and hands the form every chosen number', () => {
    renderSheet(3);
    const sheet = screen.getByRole('dialog', { name: 'myPages.nftTransfer.sendCount(count=3)' });
    expect(within(sheet).getByTestId('nft-transfer-form')).toHaveAttribute('data-ids', '1,2,3');
    expect(within(sheet).getAllByTestId('art-frame')).toHaveLength(3);
  });

  it('shows up to eight plates, counting the rest', () => {
    renderSheet(12);
    const plates = screen.getByTestId('nft-send-plates');
    expect(within(plates).getAllByTestId('art-frame')).toHaveLength(7);
    expect(plates).toHaveTextContent('+5');
    expect(screen.getByTestId('nft-transfer-form')).toHaveAttribute(
      'data-ids',
      '1,2,3,4,5,6,7,8,9,10,11,12',
    );
  });
});
