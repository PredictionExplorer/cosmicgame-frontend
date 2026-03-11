import { render, screen } from '@/test-utils';

import HowToPlayPage from '../HowToPlayPage';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

describe('HowToPlayPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the page heading', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('How To Play Guide')).toBeInTheDocument();
  });

  it('renders step 1 heading', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Step 1: Connect Your Wallet.')).toBeInTheDocument();
  });

  it('renders step 2 heading', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Step#2: Check The Bid Price!')).toBeInTheDocument();
  });

  it('renders step 3 heading', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Step#3: Make A Bid!')).toBeInTheDocument();
  });

  it('renders the cosmicsignature.com link with rel attrs', () => {
    render(<HowToPlayPage />);
    const link = screen.getByRole('link', { name: 'www.cosmicsignature.com' });
    expect(link).toHaveAttribute('href', 'https://www.cosmicsignature.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders accordion trigger for rewards', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('How To Claim My Rewards?')).toBeInTheDocument();
  });

  it('renders accordion trigger for tips', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Things To Keep In Mind:')).toBeInTheDocument();
  });

  it('renders the Discord closing link', () => {
    render(<HowToPlayPage />);
    const link = screen.getByRole('link', { name: '#cosmic-gameroom' });
    expect(link).toHaveAttribute(
      'href',
      'https://discord.com/channels/1258032742084509779/1258691600951935056',
    );
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Twitter/X closing link', () => {
    render(<HowToPlayPage />);
    const link = screen.getByRole('link', { name: 'write us a message on Twitter/X' });
    expect(link).toHaveAttribute('href', 'https://x.com/CosmicSignatureNFT');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders "Happy bidding!" closing text', () => {
    render(<HowToPlayPage />);
    expect(screen.getByText('Happy bidding!')).toBeInTheDocument();
  });
});
