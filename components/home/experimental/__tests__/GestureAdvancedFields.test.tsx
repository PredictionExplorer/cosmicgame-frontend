import userEvent from '@testing-library/user-event';

import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import { GestureAdvancedFields, type GestureAdvancedFieldsProps } from '../GestureAdvancedFields';

function makeProps(
  overrides: Partial<GestureAdvancedFieldsProps> = {},
): GestureAdvancedFieldsProps {
  return {
    gestureType: 'ETH',
    contributionType: 'NFT',
    setContributionType: jest.fn(),
    nftDonateAddress: '',
    setNftDonateAddress: jest.fn(),
    nftId: '',
    setNftId: jest.fn(),
    tokenDonateAddress: '',
    setTokenDonateAddress: jest.fn(),
    tokenAmount: '',
    setTokenAmount: jest.fn(),
    gestureCostPlus: 2,
    setBidPricePlus: jest.fn(),
    ethGestureInfo: { AuctionDuration: 3600, SecondsElapsed: 900, ETHPrice: 0.1 },
    ...overrides,
  };
}

describe('GestureAdvancedFields', () => {
  it('labels the attachment fields for the chosen kind of asset', async () => {
    const props = makeProps();
    const { rerender } = render(<GestureAdvancedFields {...props} />);

    expect(screen.getByLabelText('home.form.advanced.nftContractLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('home.form.advanced.nftIdLabel')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'home.form.advanced.attachToken' }));
    expect(props.setContributionType).toHaveBeenCalledWith('Token');

    rerender(<GestureAdvancedFields {...props} contributionType="Token" />);
    expect(screen.getByLabelText('home.form.advanced.tokenContractLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('home.form.advanced.tokenAmountLabel')).toBeInTheDocument();
  });

  it('clamps the collision buffer and quotes what the wallet sends', () => {
    const props = makeProps();
    render(<GestureAdvancedFields {...props} />);

    expect(screen.getByTestId('collision-buffer')).toHaveTextContent(
      'home.form.advanced.collision.approxCost(amount=0.102)',
    );
    const input = screen.getByLabelText('home.form.advanced.collision.raiseBy');
    fireEvent.change(input, { target: { value: '99' } });
    expect(props.setBidPricePlus).toHaveBeenLastCalledWith(50);
    fireEvent.change(input, { target: { value: '-3' } });
    expect(props.setBidPricePlus).toHaveBeenLastCalledWith(0);
  });

  it('never renders a minimum-CST protection box (the guard is nullified on V3)', () => {
    render(<GestureAdvancedFields {...makeProps()} />);
    expect(screen.queryByTestId('min-cst-protection')).not.toBeInTheDocument();
  });

  it('has no collision buffer for a CST gesture', () => {
    render(<GestureAdvancedFields {...makeProps({ gestureType: 'CST' })} />);

    expect(screen.queryByTestId('collision-buffer')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureAdvancedFields {...makeProps()} />);
    await checkA11y(container);
  });
});
