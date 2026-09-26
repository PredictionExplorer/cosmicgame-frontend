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
    gestureCstRewardAmountMin: 184.31,
    cstRewardTolerancePercent: 1,
    setCstRewardTolerancePercent: jest.fn(),
    acceptAnyCstReward: false,
    setAcceptAnyCstReward: jest.fn(),
    showAll: true,
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

  it('offers the minimum CST protection only once CST gestures exist', () => {
    const { rerender } = render(<GestureAdvancedFields {...makeProps()} />);
    expect(screen.getByTestId('min-cst-protection')).toHaveTextContent(
      'home.form.advanced.minCstProtection.minAmount(amount=184.31)',
    );

    rerender(<GestureAdvancedFields {...makeProps({ showAll: false })} />);
    expect(screen.queryByTestId('min-cst-protection')).not.toBeInTheDocument();
  });

  it('locks the tolerance while any reward is accepted', async () => {
    const props = makeProps({ acceptAnyCstReward: true });
    render(<GestureAdvancedFields {...props} />);

    expect(
      screen.getByLabelText('home.form.advanced.minCstProtection.toleranceLabel'),
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: /home\.form\.advanced\.minCstProtection\.acceptAnyTitle/,
      }),
    );
    expect(props.setAcceptAnyCstReward).toHaveBeenCalledWith(false);
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
