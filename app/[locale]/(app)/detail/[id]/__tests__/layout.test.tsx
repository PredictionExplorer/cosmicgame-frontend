import { notFound } from 'next/navigation';

import TokenLayout from '../layout';
import { parseTokenId } from '../tokenId';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const render = (id: string) => TokenLayout({ children: 'page', params: Promise.resolve({ id }) });

describe('parseTokenId', () => {
  it.each([
    ['0', 0],
    ['25', 25],
    ['000025', 25],
  ])('reads %s as %d', (id, expected) => {
    expect(parseTokenId(id)).toBe(expected);
  });

  it.each(['not-a-token', '-1', '1.5', '', '1e3', '99999999999999999999'])('refuses %p', (id) => {
    expect(parseTokenId(id)).toBeNull();
  });
});

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
