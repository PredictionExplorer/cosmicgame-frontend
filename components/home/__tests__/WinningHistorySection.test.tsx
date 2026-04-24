import '@testing-library/jest-dom';

import type { WinningHistoryEntry } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock(
  '../../../components/tables/WinningHistoryTable',
  () =>
    function MockWinningHistoryTable({ winningHistory }: { winningHistory: unknown[] }) {
      return <div data-testid="winning-table">{winningHistory.length} entries</div>;
    },
);
jest.mock(
  'yet-another-react-lightbox',
  () =>
    function MockLightbox({ open }: { open: boolean }) {
      return open ? <div data-testid="lightbox" /> : null;
    },
);
jest.mock(
  '../../../components/common/TwitterShareButton',
  () =>
    function MockTwitterShareButton() {
      return <div data-testid="twitter-share" />;
    },
);
jest.mock(
  '../../../components/common/TwitterPopup',
  () =>
    function MockTwitterPopup({ open }: { open: boolean }) {
      return open ? <div data-testid="twitter-popup" /> : null;
    },
);

import { WinningHistorySection } from '../WinningHistorySection';

const defaultProps = {
  claimHistory: null as WinningHistoryEntry[] | null,
  imageOpen: false,
  setImageOpen: jest.fn(),
  bannerTokenSeed: '',
  twitterPopupOpen: false,
  setTwitterPopupOpen: jest.fn(),
  setTwitterHandle: jest.fn(),
};

describe('WinningHistorySection', () => {
  it('renders loading state when claimHistory is null', () => {
    render(<WinningHistorySection {...defaultProps} claimHistory={null} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders table with data', () => {
    const history = [
      { RoundNum: 1, Amount: 1.5 },
      { RoundNum: 2, Amount: 2.0 },
    ];
    render(
      <WinningHistorySection
        {...defaultProps}
        claimHistory={history as unknown as WinningHistoryEntry[]}
      />,
    );
    expect(screen.getByTestId('winning-table')).toHaveTextContent('2 entries');
  });

  it('renders History of Allocations heading', () => {
    render(<WinningHistorySection {...defaultProps} />);
    expect(screen.getByText('History of Allocations')).toBeInTheDocument();
  });

  it('renders Twitter section heading', () => {
    render(<WinningHistorySection {...defaultProps} />);
    expect(screen.getByText('Create a Twitter Post and Refer People')).toBeInTheDocument();
  });

  it('renders TwitterShareButton', () => {
    render(<WinningHistorySection {...defaultProps} />);
    expect(screen.getByTestId('twitter-share')).toBeInTheDocument();
  });

  it('renders lightbox when imageOpen is true', () => {
    render(<WinningHistorySection {...defaultProps} imageOpen={true} />);
    expect(screen.getByTestId('lightbox')).toBeInTheDocument();
  });

  it('does not render lightbox when imageOpen is false', () => {
    render(<WinningHistorySection {...defaultProps} imageOpen={false} />);
    expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument();
  });

  it('renders twitter popup when open', () => {
    render(<WinningHistorySection {...defaultProps} twitterPopupOpen={true} />);
    expect(screen.getByTestId('twitter-popup')).toBeInTheDocument();
  });

  it('does not render twitter popup when closed', () => {
    render(<WinningHistorySection {...defaultProps} twitterPopupOpen={false} />);
    expect(screen.queryByTestId('twitter-popup')).not.toBeInTheDocument();
  });

  it('renders empty table when claimHistory is empty array', () => {
    render(<WinningHistorySection {...defaultProps} claimHistory={[]} />);
    expect(screen.getByTestId('winning-table')).toHaveTextContent('0 entries');
  });

  it('shows lightbox with fallback image when bannerTokenSeed is empty', () => {
    render(
      <WinningHistorySection
        {...defaultProps}
        bannerTokenSeed=""
        imageOpen={true}
        claimHistory={[]}
      />,
    );
    expect(screen.getByTestId('lightbox')).toBeInTheDocument();
  });

  it('shows lightbox when bannerTokenSeed is set', () => {
    render(
      <WinningHistorySection
        {...defaultProps}
        bannerTokenSeed="abc123"
        imageOpen={true}
        claimHistory={[]}
      />,
    );
    expect(screen.getByTestId('lightbox')).toBeInTheDocument();
  });

  it('does not show loading when claimHistory is an array', () => {
    render(<WinningHistorySection {...defaultProps} claimHistory={[]} />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<WinningHistorySection {...defaultProps} />);
    await checkA11y(container);
  });
});
