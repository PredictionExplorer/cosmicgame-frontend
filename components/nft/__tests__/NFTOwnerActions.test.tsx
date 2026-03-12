import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { NFTOwnerActions, type NFTOwnerActionsProps } from '../NFTOwnerActions';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const defaultProps: NFTOwnerActionsProps = {
  address: '',
  tokenName: '',
  nftTokenName: '',
  nameHistoryCount: 0,
  currentName: '',
  totalNamedTokens: 42,
  disabled: true,
  onAddressChange: jest.fn(),
  onTokenNameChange: jest.fn(),
  onTransfer: jest.fn(),
  onSetName: jest.fn(),
  onClearName: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe('NFTOwnerActions', () => {
  it('renders the owner actions container', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    expect(screen.getByTestId('owner-actions')).toBeInTheDocument();
  });

  it('renders "Manage Your Token" heading', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    expect(screen.getByText('Manage Your Token')).toBeInTheDocument();
  });

  it('renders transfer section with Transfer button', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Transfer/i })).toBeInTheDocument();
  });

  it('disables Transfer button when disabled prop is true', () => {
    render(<NFTOwnerActions {...defaultProps} disabled={true} />);
    expect(screen.getByRole('button', { name: /Transfer/i })).toBeDisabled();
  });

  it('enables Transfer button when disabled prop is false', () => {
    render(<NFTOwnerActions {...defaultProps} disabled={false} />);
    expect(screen.getByRole('button', { name: /Transfer/i })).not.toBeDisabled();
  });

  it('calls onTransfer when Transfer is clicked', () => {
    render(<NFTOwnerActions {...defaultProps} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Transfer/i }));
    expect(defaultProps.onTransfer).toHaveBeenCalledTimes(1);
  });

  it('renders "Set Name" when nftTokenName is empty', () => {
    render(<NFTOwnerActions {...defaultProps} nftTokenName="" />);
    expect(screen.getByRole('button', { name: /Set Name/i })).toBeInTheDocument();
  });

  it('renders "Change Name" when nftTokenName is present', () => {
    render(<NFTOwnerActions {...defaultProps} nftTokenName="MyToken" />);
    expect(screen.getByRole('button', { name: /Change Name/i })).toBeInTheDocument();
  });

  it('disables Set Name button when tokenName is empty', () => {
    render(<NFTOwnerActions {...defaultProps} tokenName="" />);
    expect(screen.getByRole('button', { name: /Set Name/i })).toBeDisabled();
  });

  it('enables Set Name button when tokenName is provided', () => {
    render(<NFTOwnerActions {...defaultProps} tokenName="NewName" />);
    expect(screen.getByRole('button', { name: /Set Name/i })).not.toBeDisabled();
  });

  it('renders Clear button when name history exists and currentName is set', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={2} currentName="OldName" />);
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
  });

  it('does not render Clear button when nameHistoryCount is 0', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={0} currentName="" />);
    expect(screen.queryByRole('button', { name: /Clear/i })).not.toBeInTheDocument();
  });

  it('calls onClearName when Clear is clicked', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={1} currentName="Name" />);
    fireEvent.click(screen.getByRole('button', { name: /Clear/i }));
    expect(defaultProps.onClearName).toHaveBeenCalledTimes(1);
  });

  it('shows total named tokens count with link', () => {
    render(<NFTOwnerActions {...defaultProps} totalNamedTokens={42} />);
    expect(screen.getByText(/42 tokens/)).toBeInTheDocument();
    expect(screen.getByText('View all named tokens').closest('a')).toHaveAttribute(
      'href',
      '/named-nfts',
    );
  });

  it('calls onAddressChange when typing in the address field', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    const addressInput = screen.getByPlaceholderText(/Recipient address/);
    fireEvent.change(addressInput, { target: { value: '0xABC' } });
    expect(defaultProps.onAddressChange).toHaveBeenCalledWith('0xABC');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTOwnerActions {...defaultProps} />);
    await checkA11y(container);
  });
});
