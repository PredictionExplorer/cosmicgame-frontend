import { render, screen, checkA11y } from '@/test-utils';

import {
  StellarSelectionPerformance,
  type StellarSelectionPerformanceProps,
} from '../StellarSelectionPerformance';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div
        data-testid={props['data-testid'] as string | undefined}
        className={props.className as string | undefined}
      >
        {children}
      </div>
    ),
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseProps: StellarSelectionPerformanceProps = {
  userInfo: {
    NumBids: 10,
    NumPrizes: 2,
    Address: '0xUser123',
    SumRaffleEthWinnings: 0.5,
    SumRaffleEthWithdrawal: 0.3,
    UnclaimedNFTs: 2,
    RaffleNFTsCount: 4,
    RewardNFTsCount: 6,
    TotalCSTokensWon: 8,
  },
  stellarSelectionETHProbability: 0.35,
  stellarSelectionNFTProbability: 0.15,
  data: { CurRoundNum: 5, TsRoundStart: 1 } as StellarSelectionPerformanceProps['data'],
};

describe('StellarSelectionPerformance', () => {
  it('renders the stellar-selection-performance container', () => {
    render(<StellarSelectionPerformance {...baseProps} />);
    expect(screen.getByTestId('stellar-selection-performance')).toBeInTheDocument();
  });

  it('renders probability bars when cycle is active', () => {
    render(<StellarSelectionPerformance {...baseProps} />);
    expect(screen.getByText('ETH Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('NFT Stellar Selection')).toBeInTheDocument();
    expect(screen.getByText('35.00%')).toBeInTheDocument();
    expect(screen.getByText('15.00%')).toBeInTheDocument();
  });

  it('hides probability bars when probability is negative', () => {
    render(
      <StellarSelectionPerformance
        {...baseProps}
        stellarSelectionETHProbability={-1}
        stellarSelectionNFTProbability={-1}
      />,
    );
    expect(screen.queryByText('ETH Stellar Selection')).not.toBeInTheDocument();
    expect(screen.queryByText('NFT Stellar Selection')).not.toBeInTheDocument();
  });

  it('hides probability bars when cycle is not active', () => {
    render(
      <StellarSelectionPerformance
        {...baseProps}
        data={{ CurRoundNum: 5, TsRoundStart: 0 } as StellarSelectionPerformanceProps['data']}
      />,
    );
    expect(screen.queryByText('Current Cycle Selection Frequency')).not.toBeInTheDocument();
  });

  it('renders Stellar Selection stat cards', () => {
    render(<StellarSelectionPerformance {...baseProps} />);
    expect(screen.getByText('Total Stellar Selection ETH')).toBeInTheDocument();
    expect(screen.getByText('ETH Retrieved')).toBeInTheDocument();
    expect(screen.getByText('Unretrieved NFTs')).toBeInTheDocument();
    expect(screen.getByText('Stellar Selection NFTs')).toBeInTheDocument();
    expect(screen.getByText('Allocation NFTs')).toBeInTheDocument();
    expect(screen.getByText('CS Tokens Received')).toBeInTheDocument();
  });

  it('displays correct total Stellar Selection ETH', () => {
    render(<StellarSelectionPerformance {...baseProps} />);
    expect(screen.getByText('0.8000 ETH')).toBeInTheDocument();
  });

  it('displays correct unretrieved NFTs count', () => {
    render(<StellarSelectionPerformance {...baseProps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('links to Stellar Selection ETH page', () => {
    render(<StellarSelectionPerformance {...baseProps} />);
    const link = screen.getByText('Total Stellar Selection ETH').closest('a');
    expect(link).toHaveAttribute('href', '/user/stellar-selection-eth/0xUser123');
  });

  it('links to Stellar Selection NFT page', () => {
    render(<StellarSelectionPerformance {...baseProps} />);
    const link = screen.getByText('Stellar Selection NFTs').closest('a');
    expect(link).toHaveAttribute('href', '/user/stellar-selection-nft/0xUser123');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<StellarSelectionPerformance {...baseProps} />);
    await checkA11y(container);
  });
});
