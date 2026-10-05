import { render, screen, checkA11y } from '@/test-utils';

import { ContactCTA, FAQ_CONTACT_LINKS } from '../components/ContactCTA';

describe('ContactCTA', () => {
  it('renders its heading and description', () => {
    render(<ContactCTA />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Still have a question?' }),
    ).toBeInTheDocument();
    // D085: says where to ask without promising a reply time.
    expect(
      screen.getByText('Ask in Discord or on X. The community and the team read both.'),
    ).toBeInTheDocument();
  });

  it('links the community channels, each opening safely in a new tab', () => {
    render(<ContactCTA />);
    const discord = screen.getByRole('link', { name: /Discord/ });
    // One platform label and one account across the site: the footer's.
    const x = screen.getByRole('link', { name: /^X \(Twitter\)/ });
    expect(discord).toHaveAttribute('href', FAQ_CONTACT_LINKS.discord);
    expect(discord).toHaveAttribute('href', 'https://discord.gg/bGnPn96Qwt');
    expect(x).toHaveAttribute('href', 'https://x.com/CosmicSignature');
    for (const link of [discord, x]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContactCTA />);
    await checkA11y(container);
  });
});
