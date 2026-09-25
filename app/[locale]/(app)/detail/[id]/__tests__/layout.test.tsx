import { notFound } from 'next/navigation';

import TokenLayout from '../layout';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const render = (id: string) => TokenLayout({ children: 'page', params: Promise.resolve({ id }) });

describe('token route layout', () => {
  afterEach(() => jest.clearAllMocks());

  // Before the loading boundary streams, so the response is a real 404.
  it('answers a malformed id with not found', async () => {
    await expect(render('not-a-token')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders the page for a token number', async () => {
    await expect(render('25')).resolves.toBe('page');
    expect(notFound).not.toHaveBeenCalled();
  });
});
