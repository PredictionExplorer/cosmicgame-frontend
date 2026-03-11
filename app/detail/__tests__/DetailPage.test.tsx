import { render, screen } from '@/test-utils';

import DetailPage from '../[id]/DetailPage';

jest.mock('../../../components/nft/NFTTrait', () => ({
  __esModule: true,
  default: ({ tokenId }: { tokenId: number }) => (
    <div data-testid="nft-trait">Token: {tokenId}</div>
  ),
}));

describe('DetailPage', () => {
  it('renders NFTTrait with the given tokenId', () => {
    render(<DetailPage tokenId={42} />);
    expect(screen.getByTestId('nft-trait')).toHaveTextContent('Token: 42');
  });

  it('shows error message for negative tokenId', () => {
    render(<DetailPage tokenId={-1} />);
    expect(screen.getByText('Invalid Token Id')).toBeInTheDocument();
  });

  it('does not render NFTTrait for negative tokenId', () => {
    render(<DetailPage tokenId={-1} />);
    expect(screen.queryByTestId('nft-trait')).not.toBeInTheDocument();
  });

  it('renders NFTTrait for tokenId 0', () => {
    render(<DetailPage tokenId={0} />);
    expect(screen.getByTestId('nft-trait')).toHaveTextContent('Token: 0');
  });
});
