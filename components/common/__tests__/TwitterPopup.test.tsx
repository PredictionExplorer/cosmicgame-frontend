import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import TwitterPopup from '../TwitterPopup';

describe('TwitterPopup', () => {
  const defaultProps = {
    open: true,
    setOpen: jest.fn(),
    setTwitterHandle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog title', () => {
    render(<TwitterPopup {...defaultProps} />);
    expect(screen.getByText('What is your Twitter handle?')).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    render(<TwitterPopup {...defaultProps} />);
    expect(screen.getByPlaceholderText('@userhandle')).toBeInTheDocument();
  });

  it('disables Ok button when handle is empty', () => {
    render(<TwitterPopup {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
  });

  it('enables Ok button when handle is entered', async () => {
    const user = userEvent.setup();
    render(<TwitterPopup {...defaultProps} />);

    await user.type(screen.getByPlaceholderText('@userhandle'), 'myhandle');

    expect(screen.getByRole('button', { name: 'Ok' })).toBeEnabled();
  });

  it('strips @ prefix and calls setTwitterHandle on confirm', async () => {
    const user = userEvent.setup();
    render(<TwitterPopup {...defaultProps} />);

    await user.type(screen.getByPlaceholderText('@userhandle'), '@myhandle');
    await user.click(screen.getByRole('button', { name: 'Ok' }));

    expect(defaultProps.setTwitterHandle).toHaveBeenCalledWith('myhandle');
  });

  it('passes handle without @ unchanged', async () => {
    const user = userEvent.setup();
    render(<TwitterPopup {...defaultProps} />);

    await user.type(screen.getByPlaceholderText('@userhandle'), 'plainhandle');
    await user.click(screen.getByRole('button', { name: 'Ok' }));

    expect(defaultProps.setTwitterHandle).toHaveBeenCalledWith('plainhandle');
  });

  it('calls setOpen(false) on cancel', async () => {
    const user = userEvent.setup();
    render(<TwitterPopup {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.setOpen).toHaveBeenCalledWith(false);
  });

  it('does not render when open is false', () => {
    render(<TwitterPopup {...defaultProps} open={false} />);
    expect(screen.queryByText('What is your Twitter handle?')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TwitterPopup {...defaultProps} />);
    await checkA11y(container);
  });
});
