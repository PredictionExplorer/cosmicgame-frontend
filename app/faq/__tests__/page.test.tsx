import { render, screen, checkA11y } from '@/test-utils';

import Page, { metadata } from '../page';

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

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

describe('app/faq/page.tsx', () => {
  describe('metadata', () => {
    it('has the correct title', () => {
      expect(metadata.title).toBe('FAQ | Cosmic Signature');
    });

    it('has the correct description', () => {
      expect(metadata.description).toContain('Cosmic Signature');
      expect(metadata.description).toMatch(/clarifications|performance cycles|gestures/i);
    });

    it('does not contain the "Frequenly" typo', () => {
      expect(metadata.description).not.toContain('Frequenly');
    });

    it('includes openGraph with matching title and description', () => {
      expect(metadata.openGraph).toEqual(
        expect.objectContaining({
          title: 'FAQ | Cosmic Signature',
        }),
      );
    });

    // The og:image is now resolved from `app/faq/opengraph-image.tsx`
    // via Next.js's file-system convention, which produces a real PNG
    // through `next/og`. Setting `metadata.openGraph.images` here would
    // override that file with whatever was passed (previously an SVG,
    // which Discord / Slack / X / Facebook / LinkedIn all reject).
    it('does not set openGraph.images so the file-system PNG is used', () => {
      expect((metadata.openGraph as { images?: unknown }).images).toBeUndefined();
    });

    it('includes twitter card metadata', () => {
      expect(metadata.twitter).toEqual(
        expect.objectContaining({
          card: 'summary_large_image',
          title: 'FAQ | Cosmic Signature',
        }),
      );
    });

    it('does not set twitter.images so the file-system PNG is used', () => {
      expect((metadata.twitter as { images?: unknown }).images).toBeUndefined();
    });
  });

  describe('Page component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      window.scrollTo = jest.fn();
    });

    it('renders the FAQPage component', () => {
      render(<Page />);
      expect(
        screen.getByRole('heading', { name: /frequently asked questions/i }),
      ).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<Page />);
      await checkA11y(container, {
        rules: {
          'heading-order': { enabled: false },
          region: { enabled: false },
        },
      });
    });
  });
});
