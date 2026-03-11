import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { NFTOwnerActions, type NFTOwnerActionsProps } from '../NFTOwnerActions';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

const noop = () => {};

const defaultProps: NFTOwnerActionsProps = {
  address: '',
  tokenName: '',
  nftTokenName: '',
  nameHistoryCount: 0,
  currentName: '',
  totalNamedTokens: 5,
  disabled: true,
  onAddressChange: noop,
  onTokenNameChange: noop,
  onTransfer: noop,
  onSetName: noop,
  onClearName: noop,
};

describe('NFTOwnerActions', () => {
  it('renders transfer input and button', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    expect(screen.getByPlaceholderText('Enter address here')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
  });

  it('renders rename input and button', () => {
    render(<NFTOwnerActions {...defaultProps} />);
    expect(screen.getByPlaceholderText('Enter token name here')).toBeInTheDocument();
  });

  it('shows "Set Name" when nftTokenName is empty', () => {
    render(<NFTOwnerActions {...defaultProps} nftTokenName="" />);
    expect(screen.getByText('Set Name')).toBeInTheDocument();
  });

  it('shows "Change Name" when nftTokenName has value', () => {
    render(<NFTOwnerActions {...defaultProps} nftTokenName="MyNFT" />);
    expect(screen.getByText('Change Name')).toBeInTheDocument();
  });

  it('shows "Clear name" when there is a current name', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={1} currentName="OldName" />);
    expect(screen.getByText('Clear name')).toBeInTheDocument();
  });

  it('hides "Clear name" when no name history', () => {
    render(<NFTOwnerActions {...defaultProps} nameHistoryCount={0} currentName="" />);
    expect(screen.queryByText('Clear name')).not.toBeInTheDocument();
  });

  it('calls onAddressChange when address input changes', () => {
    const onAddressChange = jest.fn();
    render(<NFTOwnerActions {...defaultProps} onAddressChange={onAddressChange} />);
    fireEvent.change(screen.getByPlaceholderText('Enter address here'), {
      target: { value: '0xNew' },
    });
    expect(onAddressChange).toHaveBeenCalledWith('0xNew');
  });

  it('shows total named tokens count', () => {
    render(<NFTOwnerActions {...defaultProps} totalNamedTokens={42} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTOwnerActions {...defaultProps} />);
    await checkA11y(container);
  });
});
