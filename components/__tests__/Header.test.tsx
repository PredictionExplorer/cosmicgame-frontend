import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import Header from '@/components/layout/Header';
import { OUTBOUND_LINKS } from '@/config/siteNav';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

import { render, screen, checkA11y, within, waitFor } from '@/test-utils';

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');
jest.mock('viem');

let mockAccount: string | null = null;
let mockClaims = { ETHRaffleToClaim: 0, NumDonatedNFTToClaim: 0 };
const mockAddCst = jest.fn();
const mockPathname = jest.spyOn(jest.requireMock('next/navigation'), 'usePathname');

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
      ...mockClaims,
      UnretrievedAnchorDistribution: 0,
      claimableActionIds: [],
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

jest.mock('../../hooks/useRWLKNFTContract', () => ({ __esModule: true, default: () => null }));
jest.mock('../../hooks/useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: { get_user_balance: jest.fn(), get_user_info: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = null;
  mockClaims = { ETHRaffleToClaim: 0, NumDonatedNFTToClaim: 0 };
  mockPathname.mockReturnValue('/');
});

const primaryNav = () => screen.getByRole('navigation', { name: 'nav.primaryLabel' });

/** Opens a header panel (a disclosure) and returns the panel it controls. */
async function openPanel(user: ReturnType<typeof userEvent.setup>, name: string) {
  const trigger = within(primaryNav()).getByRole('button', { name });
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const panel = document.getElementById(trigger.getAttribute('aria-controls') ?? '')!;
  expect(panel).toBeVisible();
  return { trigger, panel };
}

describe('Header', () => {
  it('links the wordmark lockup home', () => {
    render(<Header />);
    const home = screen.getByRole('link', { name: 'nav.brand.homeLabel' });
    expect(home).toHaveAttribute('href', '/');
    expect(home.querySelector('[data-brand-mark]')).toHaveAttribute('aria-hidden', 'true');
    const wordmark = home.querySelector('[data-wordmark]');
    expect(wordmark).toHaveTextContent('Cosmic Signature');
    expect(wordmark).toHaveAttribute('lang', 'en');
    expect(wordmark).toHaveAttribute('translate', 'no');
  });

  it('leads the primary navigation with the Observatory', () => {
    render(<Header />);
    const links = within(primaryNav()).getAllByRole('link');
    expect(links[0]).toHaveTextContent('nav.routes.observatory.label');
    expect(links[0]).toHaveAttribute('href', '/');
    expect(
      within(primaryNav()).getByRole('link', { name: 'nav.routes.gallery.label' }),
    ).toHaveAttribute('href', '/gallery');
    expect(
      within(primaryNav()).getByRole('button', { name: 'nav.menus.explore' }),
    ).toBeInTheDocument();
    expect(
      within(primaryNav()).getByRole('button', { name: 'nav.menus.learn' }),
    ).toBeInTheDocument();
  });

  it('keeps preferences, search and the wallet outside the navigation landmark', () => {
    render(<Header />);
    expect(
      within(primaryNav()).queryByRole('button', { name: 'common.themeSwitcher.label' }),
    ).toBeNull();
    expect(
      within(screen.getByRole('banner')).getByRole('button', { name: 'nav.search.triggerLabel' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['/', 'nav.routes.observatory.label', 'page'],
    ['/gallery', 'nav.routes.gallery.label', 'page'],
    ['/detail/25', 'nav.routes.gallery.label', 'true'],
  ])('marks the current section on %s', (path, name, current) => {
    mockPathname.mockReturnValue(path);
    render(<Header />);
    expect(within(primaryNav()).getByRole('link', { name })).toHaveAttribute(
      'aria-current',
      current,
    );
  });

  it('gives /current-cycle to Explore alone, where its panel row is', async () => {
    mockPathname.mockReturnValue('/current-cycle');
    const user = userEvent.setup();
    render(<Header />);
    const explore = within(primaryNav()).getByRole('button', { name: 'nav.menus.explore' });
    expect(explore).toHaveAttribute('aria-current', 'true');
    expect(
      within(primaryNav()).getByRole('link', { name: 'nav.routes.observatory.label' }),
    ).not.toHaveAttribute('aria-current');

    const { panel } = await openPanel(user, 'nav.menus.explore');
    expect(
      within(panel).getByRole('link', { name: /nav\.routes\.currentCycle\.label/ }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('centres the experimental glass pill behind full-height items', () => {
    mockPathname.mockReturnValue('/experimental-ui');
    render(<Header />);
    const nav = primaryNav();
    const pill = within(nav).getByTestId('header-nav-pill');
    expect(pill).toHaveClass('liquid-glass-control', 'top-1/2', '-translate-y-1/2');
    // The items keep the header's height, so the current mark sits on its rule.
    const list = within(nav).getByRole('list');
    expect(list).toHaveClass('h-full');
    expect(list).not.toHaveClass('liquid-glass-control');
  });

  it('draws no glass pill on the ordinary routes', () => {
    render(<Header />);
    expect(within(primaryNav()).queryByTestId('header-nav-pill')).toBeNull();
  });

  it('reserves the shortcut key cap before the client knows the platform', () => {
    render(<Header />);
    const kbd = screen.getByTestId('search-shortcut');
    // Always rendered at a width that fits "⌘K" and "Ctrl K".
    expect(kbd).toHaveClass('min-w-12');
    expect(kbd).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['/current-cycle', 'nav.menus.explore'],
    ['/allocation-finalized', 'nav.menus.explore'],
    ['/user/0x1', 'nav.menus.explore'],
    ['/security', 'nav.menus.learn'],
  ])('marks the panel that holds %s', (path, name) => {
    mockPathname.mockReturnValue(path);
    render(<Header />);
    expect(within(primaryNav()).getByRole('button', { name })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(
      within(primaryNav()).getByRole('link', { name: 'nav.routes.gallery.label' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('opens the Explore panel: records, statistics, Public Goods and the ecosystem', async () => {
    mockPathname.mockReturnValue('/public-goods-retrievals');
    const user = userEvent.setup();
    render(<Header />);
    const { panel: menu } = await openPanel(user, 'nav.menus.explore');

    expect(
      within(menu).getByRole('link', { name: /nav\.routes\.currentCycle\.label/ }),
    ).toHaveAttribute('href', '/current-cycle');
    expect(within(menu).getByRole('list', { name: 'nav.sections.records' })).toBeInTheDocument();
    const publicGoods = within(menu).getByRole('link', {
      name: /nav\.groups\.publicGoods\.label/,
    });
    expect(publicGoods).toHaveAttribute('href', '/public-goods-contributions-cg');
    expect(publicGoods).toHaveAttribute('aria-current', 'true');
    expect(
      within(menu).getByRole('link', { name: 'nav.routes.statisticsTokens.short' }),
    ).toHaveAttribute('href', '/statistics/tokens');

    for (const link of OUTBOUND_LINKS.filter((candidate) => candidate.group === 'ecosystem')) {
      const item = within(menu).getByRole('link', {
        name: new RegExp(`nav\\.outbound\\.${link.id}\\.label`),
      });
      expect(item).toHaveAttribute('href', link.href);
      expect(item).toHaveAttribute('target', '_blank');
      expect(item).toHaveAttribute('rel', 'noopener noreferrer');
      expect(item).toHaveTextContent('nav.link.newTab');
    }
  });

  it('opens the Learn panel with trust pages and same-tab links to the project site', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const { panel: menu } = await openPanel(user, 'nav.menus.learn');

    for (const [name, href] of [
      ['security', '/security'],
      ['riskDisclosures', '/risk-disclosures'],
      ['faq', '/faq'],
    ]) {
      expect(
        within(menu).getByRole('link', { name: new RegExp(`nav\\.routes\\.${name}\\.label`) }),
      ).toHaveAttribute('href', href);
    }
    const whitePaper = within(menu).getByRole('link', {
      name: /nav\.routes\.whitePaper\.label/,
    });
    expect(whitePaper).toHaveAttribute('href', localeHref(LANDING_ORIGIN, '/white-paper', 'en'));
    expect(whitePaper).not.toHaveAttribute('target');
  });

  it('never shows the ecosystem as a header dock', () => {
    render(<Header />);
    for (const link of OUTBOUND_LINKS) {
      expect(screen.queryByRole('link', { name: new RegExp(link.id, 'i') })).toBeNull();
    }
  });

  it('opens the command palette from the search button and with Ctrl+K', async () => {
    const user = userEvent.setup();
    render(<Header />);
    await user.click(screen.getByRole('button', { name: 'nav.search.triggerLabel' }));
    expect(await screen.findByRole('combobox')).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('combobox')).not.toBeInTheDocument());

    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Header />);
    await checkA11y(container);
  });

  it('has no accessibility violations with the Explore panel open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Header />);
    await openPanel(user, 'nav.menus.explore');
    await checkA11y(container);
  });

  it('uses the disclosure pattern for its panels: links, not menu items', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const { trigger, panel } = await openPanel(user, 'nav.menus.learn');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(within(panel).queryAllByRole('menuitem')).toHaveLength(0);

    // Tab walks into the panel's links in order.
    await user.tab();
    expect(panel).toContainElement(document.activeElement as HTMLElement);
    expect(document.activeElement?.tagName).toBe('A');

    // Escape closes it and returns to the button.
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toBeVisible();
    expect(trigger).toHaveFocus();
  });

  it('keeps one panel open at a time and closes it on a press outside', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const { trigger: explore } = await openPanel(user, 'nav.menus.explore');
    const { trigger: learn } = await openPanel(user, 'nav.menus.learn');
    expect(explore).toHaveAttribute('aria-expanded', 'false');
    await user.click(document.body);
    expect(learn).toHaveAttribute('aria-expanded', 'false');
  });

  it('names the current language on its control', () => {
    render(<Header />);
    expect(
      within(screen.getByRole('banner')).getByRole('button', {
        name: 'common.languageSwitcher.current(language=English)',
      }),
    ).toBeInTheDocument();
  });
});

describe('Header drawer', () => {
  const openDrawer = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^nav\.menuLabel/ }));
    return { user, drawer: await screen.findByRole('dialog') };
  };

  it('lists every section, with the everyday ones open', async () => {
    render(<Header />);
    const { drawer } = await openDrawer();
    for (const section of ['participate', 'collection', 'explore', 'records', 'learn', 'trust']) {
      expect(within(drawer).getByText(`nav.sections.${section}`)).toBeInTheDocument();
    }
    const participate = within(drawer).getByText('nav.sections.participate').closest('details');
    const trust = within(drawer).getByText('nav.sections.trust').closest('details');
    expect(participate).toHaveAttribute('open');
    expect(trust).not.toHaveAttribute('open');
    expect(
      within(drawer).getByRole('link', { name: /nav\.routes\.observatory\.label/ }),
    ).toHaveAttribute('href', '/');
  });

  it('opens the section of the current page and marks the page', async () => {
    mockPathname.mockReturnValue('/statistics/participation');
    render(<Header />);
    const { drawer } = await openDrawer();
    expect(within(drawer).getByText('nav.sections.explore').closest('details')).toHaveAttribute(
      'open',
    );
    expect(
      within(drawer).getByRole('link', { name: /nav\.routes\.statisticsParticipation\.label/ }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('moves the palette and language preferences into the drawer', async () => {
    render(<Header />);
    const { drawer } = await openDrawer();
    expect(
      within(drawer).getByRole('radiogroup', { name: 'common.themeSwitcher.label' }),
    ).toBeInTheDocument();
    // A menu of explicit choices, not a select that switches while it is arrowed through.
    expect(within(drawer).queryByRole('combobox')).toBeNull();
    expect(
      within(drawer).getByRole('button', {
        name: 'common.languageSwitcher.current(language=English)',
      }),
    ).toBeInTheDocument();
  });

  it('opens from the right, from a button at the end of the header', async () => {
    render(<Header />);
    const banner = screen.getByRole('banner');
    const buttons = within(banner).getAllByRole('button');
    expect(buttons.at(-1)).toHaveAccessibleName('nav.menuLabel');
    const { drawer } = await openDrawer();
    expect(drawer).toHaveClass('border-l');
  });

  it('shows the account pages first once a wallet is connected', async () => {
    mockAccount = '0x1234567890abcdef1234567890abcdef12345678';
    render(<Header />);
    const { drawer } = await openDrawer();
    const summaries = within(drawer)
      .getAllByText(/^nav\.sections\./)
      .map((node) => node.textContent);
    expect(summaries[0]).toBe('nav.sections.account');
    expect(
      within(drawer).getByRole('link', { name: /nav\.routes\.transferCst\.label/ }),
    ).toHaveAttribute('href', '/transfer-cst');
  });

  it('labels the retrieve signal for screen readers', async () => {
    mockAccount = '0x1234567890abcdef1234567890abcdef12345678';
    mockClaims = { ETHRaffleToClaim: 0.5, NumDonatedNFTToClaim: 0 };
    render(<Header />);
    const trigger = screen.getByRole('button', { name: 'nav.menuLabelWithAlert' });
    expect(trigger).toBeInTheDocument();
    const { drawer } = await openDrawer();
    expect(
      within(drawer).getByRole('link', { name: /nav\.routes\.myAllocations\.label/ }),
    ).toHaveTextContent('wallet.account.retrieveReady');
  });

  it('opens third-party links in a new tab from the ecosystem section', async () => {
    render(<Header />);
    const { drawer } = await openDrawer();
    const link = within(drawer).getByRole('link', { name: /nav\.outbound\.uniswap\.label/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('returns focus to the menu button on Escape', async () => {
    render(<Header />);
    const trigger = screen.getByRole('button', { name: 'nav.menuLabel' });
    const { user } = await openDrawer();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('has no accessibility violations with the drawer open', async () => {
    render(<Header />);
    const { drawer } = await openDrawer();
    await checkA11y(drawer);
  });
});
