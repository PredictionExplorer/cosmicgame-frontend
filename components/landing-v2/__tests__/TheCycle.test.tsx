import { render, screen } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { TheCycle } from '@/components/landing-v2/TheCycle';

const cycle = landingContentEn.cycle;
const tracks = landingContentEn.tracks.eth;

describe('<TheCycle />', () => {
  it('renders the section heading with lexicon-safe copy', () => {
    render(<TheCycle cycle={cycle} tracks={tracks} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /performance cycle/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(cycle.eyebrow)).toBeInTheDocument();
  });

  it('explains a cycle in three numbered steps, as an ordered list', () => {
    const { container } = render(<TheCycle cycle={cycle} tracks={tracks} />);
    expect(container.querySelectorAll('ol > li')).toHaveLength(3);
    expect(cycle.steps.map((step) => step.number)).toEqual(['01', '02', '03']);
    for (const step of cycle.steps) {
      expect(screen.getByRole('heading', { level: 3, name: step.title })).toBeInTheDocument();
      expect(screen.getByText(step.number)).toBeInTheDocument();
    }
  });

  it('draws the cycle above its steps, fanning into every ETH track to scale (V167)', () => {
    render(<TheCycle cycle={cycle} tracks={tracks} />);
    const diagram = screen.getByTestId('cycle-diagram');
    // Decorative: the three step captions carry the words.
    expect(diagram).toHaveAttribute('aria-hidden', 'true');
    const segments = [...diagram.querySelectorAll('rect')];
    expect(segments).toHaveLength(tracks.length);
    const heights = segments.map((segment) => Number(segment.getAttribute('height')));
    const [signature, , , , , nextCycle] = heights;
    const shareOf = (id: string) => tracks.find((track) => track.id === id)!.share;
    expect(nextCycle! / signature!).toBeCloseTo(shareOf('nextCycle') / shareOf('signature'), 5);
    expect(diagram.querySelectorAll('path')).toHaveLength(
      // one arc per gesture, one fan line per track
      diagram.querySelectorAll('line[class*="cycleGesture"]').length + tracks.length,
    );
  });

  it('leaves the Calibration Window percentages to the FAQ', () => {
    const { container } = render(<TheCycle cycle={cycle} tracks={tracks} />);
    expect(container.textContent).not.toMatch(/Calibration Window/);
    expect(container.textContent).not.toMatch(/0\.398|0\.4%/);
  });

  it('ends with a way to take the first step, and a walkthrough, in the app', () => {
    render(<TheCycle cycle={cycle} tracks={tracks} />);
    const gesture = screen.getByRole('link', { name: 'Make a gesture' });
    expect(gesture).toHaveAttribute('href', 'https://app.cosmicsignature.com#make-gesture');
    expect(gesture).not.toHaveAttribute('target');
    expect(gesture.className).toMatch(/bg-signature-gradient/);
    expect(screen.getByRole('link', { name: cycle.guideCta.label })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/how-it-works',
    );
  });

  it('has an id="cycle" anchor named by its heading', () => {
    const { container } = render(<TheCycle cycle={cycle} tracks={tracks} />);
    expect(container.querySelector('#cycle')).toHaveAttribute(
      'aria-labelledby',
      'landing-cycle-heading',
    );
  });
});
