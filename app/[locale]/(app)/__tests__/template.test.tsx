import type { HTMLAttributes, ReactNode } from 'react';

import { render, screen } from '@/test-utils';

import Template from '../template';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      variants,
      initial: _initial,
      animate: _animate,
      ...props
    }: {
      children?: ReactNode;
      variants?: Record<string, Record<string, unknown>>;
      initial?: string;
      animate?: string;
    } & HTMLAttributes<HTMLDivElement>) => (
      <div data-testid="page-motion" data-variants={JSON.stringify(variants)} {...props}>
        {children}
      </div>
    ),
  },
}));

/**
 * The route template must never apply a transform.
 *
 * Any transform on it — including `translateY(0px)`, and Framer Motion settles
 * on a sub-pixel residual rather than clearing the property — makes it the
 * containing block for every `position: fixed` descendant on the page. That
 * silently re-anchored the floating gesture CTA and the ambient backdrop to the
 * document instead of the viewport.
 */
describe('route template', () => {
  it('renders its children', () => {
    render(
      <Template>
        <p>route content</p>
      </Template>,
    );

    expect(screen.getByText('route content')).toBeInTheDocument();
  });

  it('animates opacity only, never a transform', () => {
    render(
      <Template>
        <p>route content</p>
      </Template>,
    );

    const variants = JSON.parse(
      screen.getByTestId('page-motion').getAttribute('data-variants') ?? '{}',
    ) as Record<string, Record<string, unknown>>;

    expect(variants.initial).toHaveProperty('opacity', 0);
    expect(variants.animate).toHaveProperty('opacity', 1);

    for (const state of Object.values(variants)) {
      for (const transformProp of ['x', 'y', 'scale', 'rotate', 'skew']) {
        expect(state).not.toHaveProperty(transformProp);
      }
    }
  });
});
