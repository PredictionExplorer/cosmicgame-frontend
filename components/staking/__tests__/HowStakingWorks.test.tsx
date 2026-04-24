import { checkA11y, render, screen, fireEvent } from '@/test-utils';

import { HowStakingWorks } from '../HowStakingWorks';

describe('HowStakingWorks', () => {
  it('renders the section title', () => {
    render(<HowStakingWorks />);
    expect(screen.getByText('How Anchoring Works')).toBeInTheDocument();
  });

  it('renders the introductory description', () => {
    render(<HowStakingWorks />);
    expect(
      screen.getByText('New to anchoring? Expand any section below to learn more.'),
    ).toBeInTheDocument();
  });

  it('renders all accordion trigger labels', () => {
    render(<HowStakingWorks />);
    expect(screen.getByText('What is Anchoring?')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature (CST) Anchoring')).toBeInTheDocument();
    expect(screen.getByText('RandomWalk (RWLK) Anchoring')).toBeInTheDocument();
    expect(screen.getByText('How are distributions calculated?')).toBeInTheDocument();
  });

  it('does not show content before expanding', () => {
    render(<HowStakingWorks />);
    expect(screen.queryByText(/Anchoring lets you dedicate your NFTs/)).not.toBeInTheDocument();
  });

  it('shows content after clicking a trigger', () => {
    render(<HowStakingWorks />);
    fireEvent.click(screen.getByText('What is Anchoring?'));
    expect(screen.getByText(/Anchoring lets you dedicate your NFTs/)).toBeVisible();
  });

  it('collapses previously open item when another is clicked', () => {
    render(<HowStakingWorks />);
    fireEvent.click(screen.getByText('What is Anchoring?'));
    expect(screen.getByText(/Anchoring lets you dedicate your NFTs/)).toBeVisible();

    fireEvent.click(screen.getByText('Cosmic Signature (CST) Anchoring'));
    expect(screen.getByText(/Anchor your Cosmic Signature NFTs/)).toBeVisible();
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
    fireEvent.click(screen.getByText('What is Anchoring?'));
    await checkA11y(container);
  });
});
