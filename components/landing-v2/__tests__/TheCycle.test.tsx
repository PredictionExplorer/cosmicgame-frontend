import { render, screen } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { TheCycle } from '@/components/landing-v2/TheCycle';

describe('<TheCycle />', () => {
  it('renders the section heading with lexicon-safe copy', () => {
    render(<TheCycle cycle={landingContentEn.cycle} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /performance cycle/i }),
    ).toBeInTheDocument();
  });

  it('renders the eyebrow label', () => {
    render(<TheCycle cycle={landingContentEn.cycle} />);
    expect(screen.getByText(landingContentEn.cycle.eyebrow)).toBeInTheDocument();
  });

  it('renders all four cycle stages', () => {
    render(<TheCycle cycle={landingContentEn.cycle} />);
    for (const stage of landingContentEn.cycle.stages) {
      expect(screen.getByRole('heading', { level: 3, name: stage.title })).toBeInTheDocument();
    }
  });

  it('renders the stage numbers as visible labels', () => {
    render(<TheCycle cycle={landingContentEn.cycle} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('04')).toBeInTheDocument();
  });

  it('has an id="cycle" anchor for in-page navigation', () => {
    const { container } = render(<TheCycle cycle={landingContentEn.cycle} />);
    expect(container.querySelector('#cycle')).not.toBeNull();
  });

  it('uses ordered list semantics for stages', () => {
    const { container } = render(<TheCycle cycle={landingContentEn.cycle} />);
    expect(container.querySelector('ol')).not.toBeNull();
    expect(container.querySelectorAll('ol li').length).toBe(4);
  });
});
