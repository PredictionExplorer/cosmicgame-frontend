import userEvent from '@testing-library/user-event';

import { render, screen } from '@/test-utils';

import TwitterShareButton from '../TwitterShareButton';

describe('TwitterShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the share button', () => {
    render(<TwitterShareButton />);
    expect(screen.getByRole('button', { name: 'Share on Twitter' })).toBeInTheDocument();
  });

  it('opens dialog when share button is clicked', async () => {
    const user = userEvent.setup();
    render(<TwitterShareButton />);

    await user.click(screen.getByRole('button', { name: 'Share on Twitter' }));

    expect(screen.getByText('What is your Twitter handle?')).toBeInTheDocument();
  });

  it('disables Ok when handle is empty', async () => {
    const user = userEvent.setup();
    render(<TwitterShareButton />);

    await user.click(screen.getByRole('button', { name: 'Share on Twitter' }));

    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
  });

  it('opens Twitter intent URL on confirm', async () => {
    const user = userEvent.setup();
    render(<TwitterShareButton />);

    await user.click(screen.getByRole('button', { name: 'Share on Twitter' }));
    await user.type(screen.getByPlaceholderText('@userhandle'), 'myhandle');
    await user.click(screen.getByRole('button', { name: 'Ok' }));

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://x.com/intent/tweet'),
      '_blank',
    );
  });

  it('strips @ from the handle in the tweet URL', async () => {
    const user = userEvent.setup();
    render(<TwitterShareButton />);

    await user.click(screen.getByRole('button', { name: 'Share on Twitter' }));
    await user.type(screen.getByPlaceholderText('@userhandle'), '@testuser');
    await user.click(screen.getByRole('button', { name: 'Ok' }));

    const url = (window.open as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('referred_by%3Dtestuser');
    expect(url).not.toContain('referred_by%3D%40testuser');
  });
});
