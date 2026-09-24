import { renderToString } from 'react-dom/server';

import { HeaderLede } from '@/components/layout/HeaderLede';

import { fireEvent, render, screen } from '@/test-utils';

function mockOverflow(scrollHeight: number, clientHeight: number) {
  const scroll = jest
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockReturnValue(scrollHeight);
  const client = jest
    .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
    .mockReturnValue(clientHeight);
  return () => {
    scroll.mockRestore();
    client.mockRestore();
  };
}

describe('HeaderLede', () => {
  it('drops the toggle once it measures a lede that fits', () => {
    const restore = mockOverflow(48, 48);
    render(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        A short lede.
      </HeaderLede>,
    );
    expect(screen.getByText('A short lede.')).toHaveClass('max-sm:line-clamp-3');
    expect(screen.queryByRole('button')).toBeNull();
    restore();
  });

  it('renders the toggle on the server, where nothing is measured yet', () => {
    const html = renderToString(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        A lede.
      </HeaderLede>,
    );
    expect(html).toContain('Read more');
    expect(html).toContain('aria-expanded="false"');
  });

  it('offers "Read more" when the phone clamp hides text, and expands in place', () => {
    const restore = mockOverflow(120, 72);
    render(
      <HeaderLede moreLabel="Read more" lessLabel="Show less">
        A long lede that runs past three lines on a phone.
      </HeaderLede>,
    );
    const lede = screen.getByText(/A long lede/);
    const toggle = screen.getByRole('button', { name: 'Read more' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', lede.id);

    fireEvent.click(toggle);
    expect(lede).not.toHaveClass('max-sm:line-clamp-3');
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    restore();
  });
});
