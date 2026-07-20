import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import Page, { generateMetadata } from '../page';

const pageProps = { params: Promise.resolve({ locale: 'en' }) };

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
    it('has the correct title', async () => {
      const metadata = await generateMetadata(pageProps);
      expect(metadata.title).toBe('Cosmic Signature FAQ | Arbitrum On-Chain Art Protocol');
    });

    it('has the correct description', async () => {
      const metadata = await generateMetadata(pageProps);
      expect(metadata.description).toContain('Cosmic Signature');
      expect(metadata.description).toMatch(/answers|performance cycles|gestures/i);
    });

    it('does not contain the "Frequenly" typo', async () => {
      const metadata = await generateMetadata(pageProps);
      expect(metadata.description).not.toContain('Frequenly');
    });

    it('includes openGraph with matching title and description', async () => {
      const metadata = await generateMetadata(pageProps);
      expect(metadata.openGraph).toEqual(
        expect.objectContaining({
          title: 'Cosmic Signature FAQ | Arbitrum On-Chain Art Protocol',
        }),
      );
    });

    // The og:image is now resolved from `app/faq/opengraph-image.tsx`
    // via Next.js's file-system convention, which produces a real PNG
    // through `next/og`. Setting `metadata.openGraph.images` here would
    // override that file with whatever was passed (previously an SVG,
    // which Discord / Slack / X / Facebook / LinkedIn all reject).
    it('does not set openGraph.images so the file-system PNG is used', async () => {
      const metadata = await generateMetadata(pageProps);
      expect((metadata.openGraph as { images?: unknown }).images).toBeUndefined();
    });

    it('includes twitter card metadata', async () => {
      const metadata = await generateMetadata(pageProps);
      expect(metadata.twitter).toEqual(
        expect.objectContaining({
          card: 'summary_large_image',
          title: 'Cosmic Signature FAQ | Arbitrum On-Chain Art Protocol',
        }),
      );
    });

    it('does not set twitter.images so the file-system PNG is used', async () => {
      const metadata = await generateMetadata(pageProps);
      expect((metadata.twitter as { images?: unknown }).images).toBeUndefined();
    });
  });

  describe('Page component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      window.scrollTo = jest.fn();
      window.requestAnimationFrame = (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      };
    });

    it('renders the FAQPage component', async () => {
      render(await Page(pageProps));
      expect(screen.getByRole('heading', { name: /cosmic signature faq/i })).toBeInTheDocument();
    });

    it('scrolls the popular allocation card to its canonical hash anchor', async () => {
      const user = userEvent.setup();
      render(await Page(pageProps));
      const getElementById = jest.spyOn(document, 'getElementById');
      const [popularCard] = screen.getAllByRole('button', {
        name: /What is the Signature Allocation\?/i,
      });

      await user.click(popularCard!);

      expect(getElementById).toHaveBeenCalledWith('main-allocation');
      expect(getElementById).not.toHaveBeenCalledWith('what-is-the-main-allocation');
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: expect.any(Number),
        behavior: 'smooth',
      });
      getElementById.mockRestore();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(await Page(pageProps));
      await checkA11y(container, {
        rules: {
          'heading-order': { enabled: false },
          region: { enabled: false },
        },
      });
    }, 30_000);
  });
});
