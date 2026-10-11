import { routing } from '@/i18n/routing';

import { act, checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import { InkShareMenu } from '../InkShareMenu';
import type { InkView } from '../inkLinks';

let mockLocale: string = routing.defaultLocale;
jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

const mockCopy = jest.fn();
jest.mock('@/hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

const mockSetNotification = jest.fn();
jest.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

const media: ReadonlyArray<{ view: InkView; url: string }> = [
  { view: 'image', url: 'https://media.example/images/web/ember_full.webp' },
  { view: 'short', url: 'https://media.example/videos/web/ember.mp4' },
  { view: 'medium', url: 'https://media.example/videos/web/ember_medium.mp4' },
  { view: 'slow', url: 'https://media.example/videos/web/ember_slow.mp4' },
];

function openMenu() {
  fireEvent.keyDown(screen.getByRole('button', { name: 'detail.share.trigger' }), {
    key: 'Enter',
  });
}

describe('InkShareMenu', () => {
  const originalUrl = window.location.href;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCopy.mockResolvedValue(true);
    mockLocale = routing.defaultLocale;
    // The study can be opened inside a filtered gallery. Its share URL always
    // names the artwork directly and must not copy this unrelated page state.
    window.history.replaceState({}, '', '/gallery?show=named&sort=rarity#collection');
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalUrl);
  });

  it.each(routing.locales)('copies an exact detail-page view in the %s locale', async (locale) => {
    mockLocale = locale;
    render(<InkShareMenu tokenId={48} view="medium" mediaUrl={media[2]!.url} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'detail.ink.shareView' }));

    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    await waitFor(() =>
      expect(mockCopy).toHaveBeenCalledWith(
        `${window.location.origin}${prefix}/detail/48?ink=medium`,
      ),
    );
    expect(mockSetNotification).toHaveBeenCalledWith({
      text: 'common.actions.copied',
      type: 'success',
      visible: true,
    });
    expect(window.location.pathname).toBe('/gallery');
  });

  it.each(media)(
    'shares the selected $view view rather than the default film',
    async ({ view, url }) => {
      render(<InkShareMenu tokenId={48} view={view} mediaUrl={url} />);
      openMenu();
      fireEvent.click(await screen.findByRole('menuitem', { name: 'detail.ink.shareView' }));
      await waitFor(() =>
        expect(mockCopy).toHaveBeenCalledWith(`${window.location.origin}/detail/48?ink=${view}`),
      );
    },
  );

  it.each(media)('copies the exact published $view media file', async ({ view, url }) => {
    render(<InkShareMenu tokenId={48} view={view} mediaUrl={url} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'detail.ink.shareMedia' }));
    await waitFor(() => expect(mockCopy).toHaveBeenCalledWith(url));
    expect(mockCopy).toHaveBeenCalledTimes(1);
  });

  it.each(['shareView', 'shareMedia'])(
    'reports a failed %s copy without claiming success',
    async (action) => {
      mockCopy.mockResolvedValue(false);
      render(<InkShareMenu tokenId={48} view="image" mediaUrl={media[0]!.url} />);
      openMenu();
      fireEvent.click(await screen.findByRole('menuitem', { name: `detail.ink.${action}` }));
      await waitFor(() =>
        expect(mockSetNotification).toHaveBeenCalledWith({
          text: 'detail.share.copyFailed',
          type: 'error',
          visible: true,
        }),
      );
      expect(mockSetNotification).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      );
    },
  );

  it('waits for the clipboard operation to finish before confirming it', async () => {
    let resolveCopy!: (copied: boolean) => void;
    mockCopy.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveCopy = resolve;
      }),
    );
    render(<InkShareMenu tokenId={48} view="slow" mediaUrl={media[3]!.url} />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'detail.ink.shareView' }));
    expect(mockCopy).toHaveBeenCalledTimes(1);
    expect(mockSetNotification).not.toHaveBeenCalled();

    await act(async () => resolveCopy(true));
    expect(mockSetNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('has accessible sharing actions', async () => {
    const { container } = render(
      <InkShareMenu tokenId={48} view="image" mediaUrl={media[0]!.url} />,
    );
    await checkA11y(container);
    openMenu();
    expect(await screen.findAllByRole('menuitem')).toHaveLength(2);
    await checkA11y(screen.getByRole('menu'));
  });
});
