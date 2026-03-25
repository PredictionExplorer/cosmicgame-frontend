import { checkA11y, render, screen, fireEvent } from '@/test-utils';

import { HowStakingWorks } from '../HowStakingWorks';

describe('HowStakingWorks', () => {
  it('renders the section title', () => {
    render(<HowStakingWorks />);
    expect(screen.getByText('How Staking Works')).toBeInTheDocument();
  });

  it('renders the introductory description', () => {
    render(<HowStakingWorks />);
    expect(
      screen.getByText('New to staking? Expand any section below to learn more.'),
    ).toBeInTheDocument();
  });

  it('renders all accordion trigger labels', () => {
    render(<HowStakingWorks />);
    expect(screen.getByText('What is Staking?')).toBeInTheDocument();
    expect(screen.getByText('CosmicSignature (CST) Staking')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk (RWLK) Staking')).toBeInTheDocument();
    expect(screen.getByText('How are rewards calculated?')).toBeInTheDocument();
  });

  it('does not show content before expanding', () => {
    render(<HowStakingWorks />);
    expect(screen.queryByText(/Staking lets you lock your NFTs/)).not.toBeInTheDocument();
  });

  it('shows content after clicking a trigger', () => {
    render(<HowStakingWorks />);
    fireEvent.click(screen.getByText('What is Staking?'));
    expect(screen.getByText(/Staking lets you lock your NFTs/)).toBeVisible();
  });

  it('collapses previously open item when another is clicked', () => {
    render(<HowStakingWorks />);
    fireEvent.click(screen.getByText('What is Staking?'));
    expect(screen.getByText(/Staking lets you lock your NFTs/)).toBeVisible();

    fireEvent.click(screen.getByText('CosmicSignature (CST) Staking'));
    expect(screen.getByText(/Stake your CosmicSignature NFTs/)).toBeVisible();
  });

  it('applies custom className', () => {
    const { container } = render(<HowStakingWorks className="mb-10" />);
    expect(container.firstChild).toHaveClass('mb-10');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<HowStakingWorks />);
    await checkA11y(container);
  });

  it('has no accessibility violations with expanded item', async () => {
    const { container } = render(<HowStakingWorks />);
    fireEvent.click(screen.getByText('What is Staking?'));
    await checkA11y(container);
  });
});
