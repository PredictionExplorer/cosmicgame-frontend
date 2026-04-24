import React from 'react';

import { render, screen, checkA11y } from '@/test-utils';

import { ContactCTA } from '../components/ContactCTA';

jest.mock('framer-motion', () => {
  const React = require('react');
  const cache: Record<string, React.ForwardRefExoticComponent<unknown>> = {};
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          if (!cache[prop]) {
            const Comp = React.forwardRef(function MotionProxy(
              props: Record<string, unknown>,
              ref: React.Ref<HTMLElement>,
            ) {
              const {
                initial: _i,
                animate: _a,
                whileInView: _w,
                viewport: _v,
                transition: _t,
                variants: _va,
                custom: _c,
                ...rest
              } = props;
              return React.createElement(prop, { ...rest, ref });
            });
            Comp.displayName = `motion.${prop}`;
            cache[prop] = Comp;
          }
          return cache[prop];
        },
      },
    ),
  };
});

describe('ContactCTA', () => {
  it('renders the heading "Still have a question?"', () => {
    render(<ContactCTA />);
    expect(screen.getByRole('heading', { name: 'Still have a question?' })).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<ContactCTA />);
    expect(
      screen.getByText(
        /Can't find what you're looking for\? Our community is always happy to help\./,
      ),
    ).toBeInTheDocument();
  });

  it('renders Twitter link with correct href', () => {
    render(<ContactCTA />);
    const link = screen.getByRole('link', { name: /Twitter \/ X/ });
    expect(link).toHaveAttribute('href', 'https://x.com/RandomWalkNFT');
  });

  it('renders Discord link with correct href', () => {
    render(<ContactCTA />);
    const link = screen.getByRole('link', { name: /Discord/ });
    expect(link).toHaveAttribute('href', 'https://discord.gg/bGnPn96Qwt');
  });

  it('both links open in new tab', () => {
    render(<ContactCTA />);
    const twitterLink = screen.getByRole('link', { name: /Twitter \/ X/ });
    const discordLink = screen.getByRole('link', { name: /Discord/ });
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(discordLink).toHaveAttribute('target', '_blank');
  });

  it('both links have noopener noreferrer', () => {
    render(<ContactCTA />);
    const twitterLink = screen.getByRole('link', { name: /Twitter \/ X/ });
    const discordLink = screen.getByRole('link', { name: /Discord/ });
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContactCTA />);
    await checkA11y(container);
  });
});
