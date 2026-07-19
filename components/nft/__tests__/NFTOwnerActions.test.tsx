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
    expect(screen.getByText('detail.ownerActions.title')).toBeInTheDocument();
  });

  it('renders transfer section with Transfer button', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: 'detail.ownerActions.transferButton' }),
    ).toBeInTheDocument();
  });

  it('disables Transfer button when disabled prop is true', () => {
    render(<NFTOwnerActions {...defaultProps} disabled={true} />);
    expect(
      screen.getByRole('button', { name: 'detail.ownerActions.transferButton' }),
    ).toBeDisabled();
  });

  it('enables Transfer button when disabled prop is false', () => {
    render(<NFTOwnerActions {...defaultProps} disabled={false} />);
    expect(
      screen.getByRole('button', { name: 'detail.ownerActions.transferButton' }),
    ).not.toBeDisabled();
  });

  it('calls onTransfer when Transfer is clicked', () => {
    render(<NFTOwnerActions {...defaultProps} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'detail.ownerActions.transferButton' }));
    expect(defaultProps.onTransfer).toHaveBeenCalledTimes(1);
  });

  it('renders "Set Name" when nftTokenName is empty', () => {
    render(<NFTOwnerActions {...defaultProps} nftTokenName="" />);
    expect(screen.getByRole('button', { name: 'detail.ownerActions.setName' })).toBeInTheDocument();
  });

  it('renders "Change Name" when nftTokenName is present', () => {
    render(<NFTOwnerActions {...defaultProps} nftTokenName="MyToken" />);
    expect(
      screen.getByRole('button', { name: 'detail.ownerActions.changeName' }),
    ).toBeInTheDocument();
  });

  it('disables Set Name button when tokenName is empty', () => {
    render(<NFTOwnerActions {...defaultProps} tokenName="" />);
    expect(screen.getByRole('button', { name: 'detail.ownerActions.setName' })).toBeDisabled();
  });

  it('enables Set Name button when tokenName is provided', () => {
    render(<NFTOwnerActions {...defaultProps} tokenName="NewName" />);
    expect(screen.getByRole('button', { name: 'detail.ownerActions.setName' })).not.toBeDisabled();
  });

  it('renders Clear button when name history exists and currentName is set', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={2} currentName="OldName" />);
    expect(
      screen.getByRole('button', { name: 'detail.ownerActions.clearName' }),
    ).toBeInTheDocument();
  });

  it('does not render Clear button when nameHistoryCount is 0', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={0} currentName="" />);
    expect(
      screen.queryByRole('button', { name: 'detail.ownerActions.clearName' }),
    ).not.toBeInTheDocument();
  });

  it('calls onClearName when Clear is clicked', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={1} currentName="Name" />);
    fireEvent.click(screen.getByRole('button', { name: 'detail.ownerActions.clearName' }));
    expect(defaultProps.onClearName).toHaveBeenCalledTimes(1);
  });

  it('shows total named tokens count with link', () => {
    render(<NFTOwnerActions {...defaultProps} totalNamedTokens={42} />);
    expect(
      screen.getByText(/detail\.ownerActions\.namedTokensCount\(count=42\)/),
    ).toBeInTheDocument();
    expect(screen.getByText('detail.ownerActions.viewAllNamedTokens').closest('a')).toHaveAttribute(
      'href',
      '/named-nfts',
    );
  });

  it('calls onAddressChange when typing in the address field', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    const addressInput = screen.getByPlaceholderText('detail.ownerActions.recipientPlaceholder');
    fireEvent.change(addressInput, { target: { value: '0xABC' } });
    expect(defaultProps.onAddressChange).toHaveBeenCalledWith('0xABC');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTOwnerActions {...defaultProps} />);
    await checkA11y(container);
  });
});
