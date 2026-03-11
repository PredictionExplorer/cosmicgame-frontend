import { render, screen, checkA11y } from '@/test-utils';

import FAQPage from '../FAQPage';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock('../../../components/common/FAQ', () => ({
  __esModule: true,
  default: () => <div data-testid="faq-component">FAQ Content</div>,
}));

describe('FAQPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the FAQ heading', () => {
    render(<FAQPage />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders the FAQ component', () => {
    render(<FAQPage />);
    expect(screen.getByTestId('faq-component')).toBeInTheDocument();
  });

  it('renders the "Have a question?" section', () => {
    render(<FAQPage />);
    expect(screen.getByText('Have a question?')).toBeInTheDocument();
  });

  it('renders the Twitter link with correct href and rel', () => {
    render(<FAQPage />);
    const twitterLink = screen.getByRole('link', { name: 'Twitter' });
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/RandomWalkNFT');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(twitterLink).toHaveAttribute('target', '_blank');
  });

  it('renders the Discord link with correct href and rel', () => {
    render(<FAQPage />);
    const discordLink = screen.getByRole('link', { name: 'Discord' });
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/bGnPn96Qwt');
    expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(discordLink).toHaveAttribute('target', '_blank');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FAQPage />);
    await checkA11y(container);
  });
});
