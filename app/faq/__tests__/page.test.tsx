import { render, screen, checkA11y } from '@/test-utils';

import Page, { metadata } from '../page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock('../../../components/common/FAQ', () => ({
  __esModule: true,
  default: () => <div data-testid="faq-component">FAQ Content</div>,
}));

describe('app/faq/page.tsx', () => {
  describe('metadata', () => {
    it('has the correct title', () => {
      expect(metadata.title).toBe('FAQ | Cosmic Signature');
    });

    it('has the correct description', () => {
      expect(metadata.description).toBe('Frequently Asked Questions (FAQ)');
    });

    it('does not contain the "Frequenly" typo', () => {
      expect(metadata.description).not.toContain('Frequenly');
    });

    it('includes openGraph with matching title and description', () => {
      expect(metadata.openGraph).toEqual(
        expect.objectContaining({
          title: 'FAQ | Cosmic Signature',
          description: 'Frequently Asked Questions (FAQ)',
        }),
      );
    });

    it('includes openGraph images with default logo', () => {
      const og = metadata.openGraph as { images: string[] };
      expect(og.images).toHaveLength(1);
      expect(og.images[0]).toContain('logo.png');
    });

    it('includes twitter card metadata', () => {
      expect(metadata.twitter).toEqual(
        expect.objectContaining({
          card: 'summary_large_image',
          title: 'FAQ | Cosmic Signature',
          description: 'Frequently Asked Questions (FAQ)',
        }),
      );
    });

    it('uses the same default image for twitter as openGraph', () => {
      const og = metadata.openGraph as { images: string[] };
      const tw = metadata.twitter as { images: string[] };
      expect(tw.images).toEqual(og.images);
    });
  });

  describe('Page component', () => {
    beforeEach(() => jest.clearAllMocks());

    it('renders the FAQPage component', () => {
      render(<Page />);
      expect(screen.getByTestId('faq-component')).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<Page />);
      await checkA11y(container);
    });
  });
});
