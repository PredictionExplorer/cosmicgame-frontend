import { render, screen, checkA11y, fireEvent, waitFor } from '@/test-utils';

import { MarketingCTA, OUTREACH_EMAIL } from '../MarketingCTA';

const writeText = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
});

describe('MarketingCTA', () => {
  it('names the invitation with a heading, a description and a note', () => {
    render(<MarketingCTA />);
    expect(screen.getByRole('heading', { level: 2, name: 'marketing.cta.title' })).toBeVisible();
    expect(screen.getByText('marketing.cta.description')).toBeVisible();
    expect(screen.getByText('marketing.cta.note')).toBeVisible();
  });

  it('offers a mail link, not an external-site link', () => {
    render(<MarketingCTA />);
    const link = screen.getByRole('link', { name: 'marketing.cta.contact' });
    expect(link).toHaveAttribute('href', `mailto:${OUTREACH_EMAIL}`);
    expect(link).not.toHaveAttribute('target');
    expect(link.querySelector('.lucide-mail')).not.toBeNull();
    expect(link.querySelector('.lucide-external-link, .lucide-arrow-up-right')).toBeNull();
  });

  it('shows the address as text and copies it', async () => {
    render(<MarketingCTA />);
    expect(screen.getByText(OUTREACH_EMAIL)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'marketing.cta.copyEmail' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(OUTREACH_EMAIL));
    expect(
      await screen.findByRole('button', { name: 'marketing.cta.emailCopied' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('marketing.cta.emailCopied');
  });

  it('carries no info buttons', () => {
    render(<MarketingCTA />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MarketingCTA />);
    await checkA11y(container);
  });
});
