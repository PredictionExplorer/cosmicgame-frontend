import { createMetadata } from '@/utils/seo';

function expectIndexable(metadata: { robots?: unknown }) {
  expect(metadata.robots).toEqual(
    expect.objectContaining({
      index: true,
      follow: true,
      googleBot: expect.objectContaining({
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      }),
    }),
  );
}

function expectNoIndex(metadata: { robots?: unknown }) {
  expect(metadata.robots).toEqual(
    expect.objectContaining({
      index: false,
      follow: true,
      googleBot: expect.objectContaining({
        index: false,
        follow: true,
      }),
    }),
  );
}

describe('SEO route policy', () => {
  it('marks major public protocol pages as indexable with rich snippets allowed', () => {
    expectIndexable(createMetadata('Public', 'Public description', undefined, '/statistics'));
    expectIndexable(createMetadata('Contracts', 'Contract description', undefined, '/contracts'));
  });

  it('marks admin and wallet-specific pages as noindex,follow', () => {
    expectNoIndex(
      createMetadata('Admin', 'Admin description', undefined, '/admin', { index: false }),
    );
    expectNoIndex(
      createMetadata('My Tokens', 'Wallet description', undefined, '/my-tokens', {
        index: false,
      }),
    );
  });

  it('marks user profile routes as noindex with a self canonical', () => {
    const metadata = createMetadata(
      'Information for User 0x0000000000000000000000000000000000000000 | Cosmic Signature',
      'Information for User 0x0000000000000000000000000000000000000000',
      undefined,
      '/user/0x0000000000000000000000000000000000000000',
      { index: false },
    );

    expectNoIndex(metadata);
    expect(metadata.alternates).toEqual({
      canonical: 'https://app.cosmicsignature.com/user/0x0000000000000000000000000000000000000000',
    });
  });
});
