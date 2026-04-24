import '@testing-library/jest-dom';

import { Section } from '@/components/ui/section';

import { render, screen, checkA11y } from '@/test-utils';

describe('Section', () => {
  it('renders a <section> with children', () => {
    render(<Section disableReveal>body</Section>);
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('body');
  });

  it('renders the header slot when provided', () => {
    render(
      <Section
        disableReveal
        eyebrow="Allocation"
        title="Cycle #42"
        description="Details about the cycle"
      >
        body
      </Section>,
    );
    expect(screen.getByText('Allocation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cycle #42/i })).toBeInTheDocument();
    expect(screen.getByText(/details about the cycle/i)).toBeInTheDocument();
  });

  it('applies density variants', () => {
    const { container, rerender } = render(
      <Section disableReveal density="compact">
        body
      </Section>,
    );
    expect(container.querySelector('section')).toHaveClass('py-8');

    rerender(
      <Section disableReveal density="tight">
        body
      </Section>,
    );
    expect(container.querySelector('section')).toHaveClass('py-4');
  });

  it('renders actions slot', () => {
    render(
      <Section disableReveal title="Header" actions={<button>Click</button>}>
        body
      </Section>,
    );
    expect(screen.getByRole('button', { name: /click/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Section disableReveal eyebrow="Tracks" title="Protocol" description="Overview">
        body
      </Section>,
    );
    await checkA11y(container);
  });
});
