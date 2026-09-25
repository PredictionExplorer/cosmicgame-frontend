import { render, screen, fireEvent, waitFor, checkA11y } from '@/test-utils';

import { NFTShareMenu } from '../NFTShareMenu';

const mockCopy = jest.fn().mockResolvedValue(true);
jest.mock('../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

const mockSetNotification = jest.fn();
jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

function openMenu() {
  // Radix opens its menu from the keyboard as well as the pointer.
  fireEvent.keyDown(screen.getByRole('button', { name: /detail.share.trigger/ }), { key: 'Enter' });
}

describe('NFTShareMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCopy.mockResolvedValue(true);
  });

  it('copies the image link and confirms it', async () => {
    render(<NFTShareMenu imageUrl="https://media/0xabc.png" videoUrl="https://media/0xabc.mp4" />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'detail.share.copyImageLink' }));
    await waitFor(() => expect(mockCopy).toHaveBeenCalledWith('https://media/0xabc.png'));
    expect(mockSetNotification).toHaveBeenCalledWith({
      text: 'common.actions.copied',
      type: 'success',
      visible: true,
    });
  });

  it('never confirms a copy that failed, and says it failed', async () => {
    mockCopy.mockResolvedValue(false);
    render(<NFTShareMenu imageUrl="https://media/0xabc.png" />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'detail.share.copyImageLink' }));
    await waitFor(() => expect(mockCopy).toHaveBeenCalled());
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
  });

  it('copies the page link', async () => {
    render(<NFTShareMenu />);
    openMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: 'detail.share.copyPageLink' }));
    await waitFor(() => expect(mockCopy).toHaveBeenCalledWith(window.location.href));
  });

  it('offers only the links that exist', async () => {
    render(<NFTShareMenu imageUrl={null} videoUrl={null} />);
    openMenu();
    expect(await screen.findAllByRole('menuitem')).toHaveLength(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTShareMenu imageUrl="https://media/0xabc.png" />);
    await checkA11y(container);
  });
});
