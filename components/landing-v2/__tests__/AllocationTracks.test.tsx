import { render, screen } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';
import { ethDistributionFacts } from '@/content/protocol-facts';

import { AllocationTracks } from '@/components/landing-v2/AllocationTracks';

describe('<AllocationTracks />', () => {
  it('renders the section heading and eyebrow', () => {
    render(<AllocationTracks tracks={landingContentEn.tracks} />);
    expect(screen.getByText(landingContentEn.tracks.eyebrow)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      landingContentEn.tracks.heading,
    );
  });

  it('renders all ten allocation track cards', () => {
    render(<AllocationTracks tracks={landingContentEn.tracks} />);
    for (const item of landingContentEn.tracks.items) {
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument();
    }
  });

  it('renders the Signature Allocation percentage prominently', () => {
    render(<AllocationTracks tracks={landingContentEn.tracks} />);
    expect(
      screen.getByRole('heading', { level: 3, name: /Signature Allocation/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(`${ethDistributionFacts.mainEthPercentage}%`)).toBeInTheDocument();
  });

  it('renders the Public Goods Allocation card with its percentage and Protocol Guild reference', () => {
    render(<AllocationTracks tracks={landingContentEn.tracks} />);
    expect(
      screen.getAllByText(`${ethDistributionFacts.publicGoodsPercentage}%`).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Protocol Guild/i)).toBeInTheDocument();
  });

  it('renders the Compounding Cycle Reserve as approximately 50%', () => {
    render(<AllocationTracks tracks={landingContentEn.tracks} />);
    expect(screen.getByText('~50%')).toBeInTheDocument();
  });

  it('has an id="tracks" anchor for in-page navigation', () => {
    const { container } = render(<AllocationTracks tracks={landingContentEn.tracks} />);
    expect(container.querySelector('#tracks')).not.toBeNull();
  });

  it('contains no banned lexicon terms in the rendered DOM', () => {
    const { container } = render(<AllocationTracks tracks={landingContentEn.tracks} />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\bprize(?:s|d)?\b/i);
    expect(text).not.toMatch(/\braffle(?:s)?\b/i);
    expect(text).not.toMatch(/\bwinner(?:s)?\b/i);
    expect(text).not.toMatch(/\byield\b/i);
    expect(text).not.toMatch(/\bcharit(?:y|able)\b/i);
  });
});
