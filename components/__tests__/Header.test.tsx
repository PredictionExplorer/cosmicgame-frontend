import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import Header from '@/components/layout/Header';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

import { render, screen, checkA11y, within, act, waitFor } from '@/test-utils';

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');
jest.mock('viem');

let mockAccount: string | null = null;
const mockAddCst = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    chainId: 421614,
    active: mockAccount !== null,
  }),
}));

jest.mock('../../hooks/useMetaMaskWatchAsset', () => ({
  useMetaMaskWatchAsset: () => ({
    isMetaMaskConnected: mockAccount !== null,
    isAddingCst: false,
    isAddingNft: false,
    addCst: mockAddCst,
    addCosmicSignatureNft: jest.fn(),
  }),
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
  mockAccount = null;
  setViewportWidth(1440);
});

describe('Header (desktop)', () => {
  it('renders the logo linked to home', () => {
    render(<Header />);
    const logo = screen.getByAltText('Cosmic Signature');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo2.svg');
    expect(screen.getByRole('link', { name: 'nav.brand.homeLabel' })).toHaveAttribute('href', '/');
  });

  it('renders the brand wordmark next to the logo', () => {
    render(<Header />);
    const home = screen.getByRole('link', { name: 'nav.brand.homeLabel' });
    expect(within(home).getByText('Cosmic Signature')).toBeInTheDocument();
    expect(within(home).getByText('nav.brand.tagline')).toBeInTheDocument();
  });

  it('renders the primary navigation rail with lexicon-safe labels', () => {
    render(<Header />);
    const primaryNav = screen.getByRole('navigation', { name: 'nav.primaryLabel' });
    expect(within(primaryNav).getByText('nav.links.gallery.label')).toBeInTheDocument();
    expect(within(primaryNav).getByText('nav.links.explore.label')).toBeInTheDocument();
    expect(within(primaryNav).getByText('nav.links.help.label')).toBeInTheDocument();
  });

  it('links Gallery directly to the gallery page', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: 'nav.links.gallery.label' })).toHaveAttribute(
      'href',
      '/gallery',
    );
  });

  it('opens the Explore panel with icons and supporting copy', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.links.explore.label' }));

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('nav.links.currentCycle.label')).toBeInTheDocument();
    expect(within(menu).getByText('nav.links.currentCycle.description')).toBeInTheDocument();
    expect(within(menu).getByText('nav.links.statistics.label')).toBeInTheDocument();
    expect(within(menu).getByText('nav.links.contracts.label')).toBeInTheDocument();

    const links = within(menu).getAllByRole('menuitem');
    expect(links.length).toBe(6);
  });

  it('hosts the Discover destination as the featured card in the Help panel', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.links.help.label' }));

    const menu = await screen.findByRole('menu');
    const discover = within(menu).getByRole('menuitem', {
      name: /nav\.links\.discover\.label/i,
    });
    expect(discover).toHaveAttribute('href', 'https://cosmicsignature.com');
    expect(discover).toHaveAttribute('rel', 'noopener');
    expect(within(menu).getByText('nav.links.discover.description')).toBeInTheDocument();
  });

  it('keeps internal and cross-host help links in the Help panel', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.links.help.label' }));

    const menu = await screen.findByRole('menu');
    expect(
      within(menu).getByRole('menuitem', { name: /nav\.links\.howItWorks\.label/i }),
    ).toHaveAttribute('href', '/how-it-works');
    expect(within(menu).getByRole('menuitem', { name: /nav\.links\.faq\.label/i })).toHaveAttribute(
      'href',
      '/faq',
    );
    expect(
      within(menu).getByRole('menuitem', { name: /nav\.links\.about\.label/i }),
    ).toHaveAttribute('href', 'https://cosmicsignature.com/about');
    expect(
      within(menu).getByRole('menuitem', { name: /nav\.links\.learn\.label/i }),
    ).toHaveAttribute('href', 'https://cosmicsignature.com/learn');
  });

  it('renders the ecosystem dock with all three destinations', () => {
    render(<Header />);

    const dock = screen.getByRole('group', { name: 'nav.ecosystem.groupLabel' });
    expect(
      within(dock).getByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' }),
    ).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
    expect(
      within(dock).getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' }),
    ).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(
      within(dock).getByRole('link', { name: 'nav.ecosystem.chaosZero.ariaLabel' }),
    ).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
  });

  it('names Axiom Zero and Chaos Zero visibly in the dock', () => {
    render(<Header />);

    const dock = screen.getByRole('group', { name: 'nav.ecosystem.groupLabel' });
    expect(within(dock).getByText('nav.ecosystem.axiomZero.name')).toBeInTheDocument();
    expect(within(dock).getByText('nav.ecosystem.chaosZero.name')).toBeInTheDocument();
    expect(within(dock).getByText('nav.ecosystem.uniswap.name')).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'nav.links.help.label' }));
    const menu = await screen.findByRole('menu');

    // Scoped to the panel: Radix aria-hides background content while open.
    await checkA11y(menu);
  });
});

describe('Header (mobile)', () => {
  it('exposes drawer state and returns keyboard focus to its trigger', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const trigger = screen.getByRole('button', { name: 'nav.menuLabel' });

    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the drawer when resizing to desktop and keeps it closed on return', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByRole('button', { name: 'nav.menuLabel' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    act(() => {
      setViewportWidth(1440);
      window.dispatchEvent(new Event('resize'));
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    act(() => {
      setViewportWidth(820);
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByRole('button', { name: 'nav.menuLabel' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  beforeEach(() => {
    setViewportWidth(375);
  });

  it('shows a mobile wallet connect button without opening the drawer', async () => {
    render(<Header />);

    expect(await screen.findByTestId('connect-wallet-button')).toBeVisible();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the drawer with primary navigation links', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.menuLabel' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('link', { name: /nav\.links\.gallery\.label/i }),
    ).toHaveAttribute('href', '/gallery');
    expect(
      within(dialog).getByRole('link', { name: /nav\.links\.currentCycle\.label/i }),
    ).toHaveAttribute('href', '/current-cycle');
    expect(within(dialog).getByRole('link', { name: /nav\.links\.faq\.label/i })).toHaveAttribute(
      'href',
      '/faq',
    );
  });

  it('lets connected MetaMask users add CST from the drawer', async () => {
    const user = userEvent.setup();
    mockAccount = '0x1234567890abcdef1234567890abcdef12345678';
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.menuLabel' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'wallet.account.addCstToMetaMask' }),
    );
    expect(mockAddCst).toHaveBeenCalledTimes(1);
  });

  it('renders the ecosystem section inside the drawer', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.menuLabel' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('nav.sections.ecosystem')).toBeInTheDocument();
    expect(
      within(dialog).getByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' }),
    ).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
    expect(
      within(dialog).getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' }),
    ).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(
      within(dialog).getByRole('link', { name: 'nav.ecosystem.chaosZero.ariaLabel' }),
    ).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
  });

  it('renders the featured Discover card inside the drawer', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.menuLabel' }));

    const dialog = await screen.findByRole('dialog');
    const discover = within(dialog).getByRole('link', { name: /nav\.links\.discover\.label/i });
    expect(discover).toHaveAttribute('href', 'https://cosmicsignature.com');
    expect(discover).toHaveAttribute('rel', 'noopener');
  });

  it('opens ecosystem links in a new tab with safe rel attributes', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.menuLabel' }));

    const dialog = await screen.findByRole('dialog');
    for (const name of [
      'nav.ecosystem.uniswap.ariaLabel',
      'nav.ecosystem.axiomZero.ariaLabel',
      'nav.ecosystem.chaosZero.ariaLabel',
    ]) {
      const link = within(dialog).getByRole('link', { name });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('has no accessibility violations with the drawer open', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'nav.menuLabel' }));
    const dialog = await screen.findByRole('dialog');

    // Scoped to the drawer: Radix aria-hides background content while open.
    await checkA11y(dialog);
  });
});
