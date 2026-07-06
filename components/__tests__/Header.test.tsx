import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import Header from '@/components/layout/Header';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

import { render, screen, checkA11y, within } from '@/test-utils';

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');
jest.mock('viem');

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: null, chainId: 421614, active: false }),
}));

jest.mock('../../contexts/ApiDataContext', () => ({
  useApiData: () => ({
    apiData: {
      ETHRaffleToClaim: 0,
      ETHRaffleToClaimWei: 0,
      NumDonatedNFTToClaim: 0,
      UnretrievedAnchorDistribution: 0,
      releasableActionIds: [],
    },
    setApiData: jest.fn(),
    fetchData: jest.fn(),
    unclaimedRewards: [],
  }),
}));

jest.mock('../../contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => ({ cstokens: [], rwlktokens: [], fetchData: jest.fn() }),
}));

jest.mock('../../contexts/SystemModeContext', () => ({
  useSystemMode: () => ({ data: 0, fetchData: jest.fn() }),
}));

jest.mock('../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get_user_balance: jest.fn(),
    get_user_info: jest.fn(),
  },
}));

const setViewportWidth = (value: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value });
};

beforeEach(() => {
  jest.clearAllMocks();
  setViewportWidth(1200);
});

describe('Header (desktop)', () => {
  it('renders the logo linked to home', () => {
    render(<Header />);
    const logo = screen.getByAltText('Cosmic Signature');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo2.svg');
    expect(screen.getByRole('link', { name: /cosmic signature home/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders the brand wordmark next to the logo', () => {
    render(<Header />);
    const home = screen.getByRole('link', { name: /cosmic signature home/i });
    expect(within(home).getByText('Cosmic Signature')).toBeInTheDocument();
    expect(within(home).getByText(/on-chain art protocol/i)).toBeInTheDocument();
  });

  it('renders the primary navigation rail with lexicon-safe labels', () => {
    render(<Header />);
    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(primaryNav).getByText('Gallery')).toBeInTheDocument();
    expect(within(primaryNav).getByText('Explore')).toBeInTheDocument();
    expect(within(primaryNav).getByText('Help')).toBeInTheDocument();
  });

  it('links Gallery directly to the gallery page', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Gallery' })).toHaveAttribute('href', '/gallery');
  });

  it('opens the Explore panel with icons and supporting copy', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: /explore/i }));

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Current Cycle')).toBeInTheDocument();
    expect(within(menu).getByText('Live gestures shaping the active cycle')).toBeInTheDocument();
    expect(within(menu).getByText('Statistics')).toBeInTheDocument();
    expect(within(menu).getByText('Contracts')).toBeInTheDocument();

    const links = within(menu).getAllByRole('menuitem');
    expect(links.length).toBe(6);
  });

  it('hosts the Discover destination as the featured card in the Help panel', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: /help/i }));

    const menu = await screen.findByRole('menu');
    const discover = within(menu).getByRole('menuitem', {
      name: /discover cosmic signature/i,
    });
    expect(discover).toHaveAttribute('href', 'https://cosmicsignature.com');
    expect(discover).toHaveAttribute('rel', 'noopener');
    expect(within(menu).getByText('The art, the story, and the protocol')).toBeInTheDocument();
  });

  it('keeps internal and cross-host help links in the Help panel', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: /help/i }));

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: /how it works/i })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
    expect(within(menu).getByRole('menuitem', { name: /faq/i })).toHaveAttribute('href', '/faq');
    expect(within(menu).getByRole('menuitem', { name: /about cosmic signature/i })).toHaveAttribute(
      'href',
      'https://cosmicsignature.com/about',
    );
    expect(within(menu).getByRole('menuitem', { name: /learn hub/i })).toHaveAttribute(
      'href',
      'https://cosmicsignature.com/learn',
    );
  });

  it('renders the ecosystem dock with all three destinations', () => {
    render(<Header />);

    const dock = screen.getByRole('group', { name: 'Cosmic Signature ecosystem' });
    expect(within(dock).getByRole('link', { name: 'Trade CST on Uniswap' })).toHaveAttribute(
      'href',
      CST_UNISWAP_SWAP_URL,
    );
    expect(within(dock).getByRole('link', { name: 'Axiom Zero NFT marketplace' })).toHaveAttribute(
      'href',
      COSMIC_SIGNATURE_MARKETPLACE_URL,
    );
    expect(
      within(dock).getByRole('link', { name: 'Make predictions on Chaos Zero' }),
    ).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
  });

  it('names Axiom Zero and Chaos Zero visibly in the dock', () => {
    render(<Header />);

    const dock = screen.getByRole('group', { name: 'Cosmic Signature ecosystem' });
    expect(within(dock).getByText('Axiom Zero')).toBeInTheDocument();
    expect(within(dock).getByText('Chaos Zero')).toBeInTheDocument();
    expect(within(dock).getByText('Trade CST')).toBeInTheDocument();
  });

  it('does not render a maintenance banner when systemMode is 0', () => {
    render(<Header />);
    expect(screen.queryByText(/MAINTENANCE/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Header />);
    await checkA11y(container);
  });

  it('has no accessibility violations with the Help panel open', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: /help/i }));
    const menu = await screen.findByRole('menu');

    // Scoped to the panel: Radix aria-hides background content while open.
    await checkA11y(menu);
  });
});

describe('Header (mobile)', () => {
  beforeEach(() => {
    setViewportWidth(375);
  });

  it('shows a mobile wallet connect button without opening the drawer', async () => {
    render(<Header />);

    expect(await screen.findByRole('button', { name: 'Connect Wallet' })).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the drawer with primary navigation links', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'menu' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('link', { name: /gallery/i })).toHaveAttribute(
      'href',
      '/gallery',
    );
    expect(within(dialog).getByRole('link', { name: /current cycle/i })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    expect(within(dialog).getByRole('link', { name: /faq/i })).toHaveAttribute('href', '/faq');
  });

  it('renders the ecosystem section inside the drawer', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'menu' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Ecosystem')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Trade CST on Uniswap' })).toHaveAttribute(
      'href',
      CST_UNISWAP_SWAP_URL,
    );
    expect(
      within(dialog).getByRole('link', { name: 'Axiom Zero NFT marketplace' }),
    ).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(
      within(dialog).getByRole('link', { name: 'Make predictions on Chaos Zero' }),
    ).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
  });

  it('renders the featured Discover card inside the drawer', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'menu' }));

    const dialog = await screen.findByRole('dialog');
    const discover = within(dialog).getByRole('link', { name: /discover cosmic signature/i });
    expect(discover).toHaveAttribute('href', 'https://cosmicsignature.com');
    expect(discover).toHaveAttribute('rel', 'noopener');
  });

  it('opens ecosystem links in a new tab with safe rel attributes', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'menu' }));

    const dialog = await screen.findByRole('dialog');
    for (const name of [
      'Trade CST on Uniswap',
      'Axiom Zero NFT marketplace',
      'Make predictions on Chaos Zero',
    ]) {
      const link = within(dialog).getByRole('link', { name });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('has no accessibility violations with the drawer open', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'menu' }));
    const dialog = await screen.findByRole('dialog');

    // Scoped to the drawer: Radix aria-hides background content while open.
    await checkA11y(dialog);
  });
});
