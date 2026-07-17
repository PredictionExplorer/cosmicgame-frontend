import userEvent from '@testing-library/user-event';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { LinkifiedText } from '../linkified-text';

describe('LinkifiedText', () => {
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it('renders plain text without any link button', () => {
    render(<LinkifiedText text="gm cosmos" />);

    expect(screen.getByText('gm cosmos')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders URLs as buttons and keeps surrounding text', () => {
    render(<LinkifiedText text="check https://example.com now" />);

    expect(screen.getByText('check')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'https://example.com' })).toBeInTheDocument();
    expect(screen.getByText('now')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a confirmation dialog showing the full destination before leaving', async () => {
    const user = userEvent.setup();
    render(<LinkifiedText text="check https://example.com/claim now" />);

    await user.click(screen.getByRole('button', { name: 'https://example.com/claim' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('common.externalLink.title');
    expect(screen.getByTestId('external-link-destination')).toHaveTextContent(
      'https://example.com/claim',
    );
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('cancelling the dialog does not open the link', async () => {
    const user = userEvent.setup();
    render(<LinkifiedText text="https://example.com" />);

    await user.click(screen.getByRole('button', { name: 'https://example.com' }));
    await user.click(await screen.findByRole('button', { name: 'common.actions.cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('confirming opens the link in a new tab without opener access', async () => {
    const user = userEvent.setup();
    render(<LinkifiedText text="www.example.com" />);

    await user.click(screen.getByRole('button', { name: 'www.example.com' }));
    await user.click(await screen.findByRole('button', { name: 'common.externalLink.open' }));

    expect(openSpy).toHaveBeenCalledWith(
      'https://www.example.com',
      '_blank',
      'noopener,noreferrer',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('copies the pending URL from the dialog', async () => {
    const originalClipboard = navigator.clipboard;
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    try {
      render(<LinkifiedText text="https://example.com" />);

      fireEvent.click(screen.getByRole('button', { name: 'https://example.com' }));
      fireEvent.click(await screen.findByRole('button', { name: 'common.externalLink.copy' }));

      expect(writeText).toHaveBeenCalledWith('https://example.com');
      expect(
        await screen.findByRole('button', { name: 'common.externalLink.copied' }),
      ).toBeInTheDocument();
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    }
  });

  it('has no accessibility violations with the dialog open', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<LinkifiedText text="see https://example.com" />);

    await user.click(screen.getByRole('button', { name: 'https://example.com' }));
    await screen.findByRole('dialog');

    await checkA11y(baseElement);
  });
});
