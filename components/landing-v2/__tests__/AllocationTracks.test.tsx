import { render, screen } from '@testing-library/react';

import { landingContent } from '@/content/landing';

import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';

describe('<AllocationTracks />', () => {
  it('renders the section heading and eyebrow', () => {
    render(<AllocationTracks />);
    expect(screen.getByText(landingContent.tracks.eyebrow)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      landingContent.tracks.heading,
    );
  });

  it('renders all ten allocation track cards', () => {
    render(<AllocationTracks />);
    for (const item of landingContent.tracks.items) {
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument();
    }
  });

  it('renders the Signature Allocation percentage prominently', () => {
    render(<AllocationTracks />);
    expect(
      screen.getByRole('heading', { level: 3, name: /Signature Allocation/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('renders the Public Goods Allocation card with 7% and Protocol Guild reference', () => {
    render(<AllocationTracks />);
    expect(screen.getByText('7%')).toBeInTheDocument();
    expect(screen.getByText(/Protocol Guild/i)).toBeInTheDocument();
  });

  it('renders the Compounding Cycle Reserve as approximately 50%', () => {
    render(<AllocationTracks />);
    expect(screen.getByText('~50%')).toBeInTheDocument();
  });

  it('has an id="tracks" anchor for in-page navigation', () => {
    const { container } = render(<AllocationTracks />);
    expect(container.querySelector('#tracks')).not.toBeNull();
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<AllocationTracks />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
    expect(text).not.toMatch(/\braffle(?:s)?\b/i);
    expect(text).not.toMatch(/\bwinner(?:s)?\b/i);
    expect(text).not.toMatch(/\byield\b/i);
    expect(text).not.toMatch(/\bcharit(?:y|able)\b/i);
  });
});
