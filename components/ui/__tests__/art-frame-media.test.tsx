/**
 * Media URLs and media failover in the art frame, with two media servers
 * (the API rotation's list, mocked here; the rest of the rotation is real).
 */
import { ArtFrame } from '@/components/ui/art-frame';
import { MEDIA_ORIGIN, getThumbUrl, mediaFailoverUrl, mediaPathKey } from '@/utils/urls';

import { render, screen, fireEvent } from '@/test-utils';

jest.mock('@/lib/serverRotation', () => ({
  ...jest.requireActual('@/lib/serverRotation'),
  apiBaseUrls: ['https://a1.example/api/cosmicgame', 'https://a2.example/api/cosmicgame'],
}));

const A1 = 'https://a1.example';
const A2 = 'https://a2.example';
const FULL = '/images/new/cosmicsignature/0xabc/images/web/full.webp';
const PNG = '/images/new/cosmicsignature/0xabc.png';

describe('media origin', () => {
  afterEach(() => jest.useRealTimers());

  it('builds every media URL on one server, whatever the hour', () => {
    // Regression: media followed the API's hourly rotation, so a page cached
    // in one hour swapped every image's host while hydrating in the next.
    jest.useFakeTimers({ now: new Date('2026-09-25T07:10:00Z') });
    const thisHour = getThumbUrl('abc', 'card');
    jest.setSystemTime(new Date('2026-09-25T08:10:00Z'));

    expect(MEDIA_ORIGIN).toBe(A1);
    expect(getThumbUrl('abc', 'card')).toBe(thisHour);
    expect(thisHour).toBe(`${A1}/images/new/cosmicsignature/0xabc/thumb_card.webp`);
  });

  it('names the same file on the next server, and compares the copies by path', () => {
    expect(mediaFailoverUrl(`${A1}${FULL}`)).toBe(`${A2}${FULL}`);
    expect(mediaFailoverUrl(`${A2}${FULL}`)).toBe(`${A1}${FULL}`);
    expect(mediaFailoverUrl(`https://elsewhere.example${FULL}`)).toBeNull();
    expect(mediaPathKey(`${A1}${FULL}`)).toBe(mediaPathKey(`${A2}${FULL}`));
  });
});

describe('ArtFrame media failover', () => {
  it('tries a failed file once on the next media server before its next source', () => {
    render(
      <ArtFrame
        sources={[`${A1}${FULL}`, `${A1}${PNG}`]}
        alt="Art"
        sizes="100vw"
        unavailableLabel="Artwork unavailable"
      />,
    );
    const image = () => screen.getByAltText('Art');
    expect(image()).toHaveAttribute('src', `${A1}${FULL}`);

    fireEvent.error(image());
    expect(image()).toHaveAttribute('src', `${A2}${FULL}`);

    // The copy failed too: on to the next source, never back and forth.
    fireEvent.error(image());
    expect(image()).toHaveAttribute('src', `${A1}${PNG}`);
    fireEvent.error(image());
    expect(image()).toHaveAttribute('src', `${A2}${PNG}`);
    fireEvent.error(image());
    expect(screen.queryByAltText('Art')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Art' })).toHaveTextContent('Artwork unavailable');
  });

  it('keeps a painted plate when only the media server of its files changes', () => {
    const onStatusChange = jest.fn();
    const props = { alt: 'Art', sizes: '100vw', unavailableLabel: 'Unavailable', onStatusChange };
    const { rerender } = render(<ArtFrame sources={[`${A1}${FULL}`]} {...props} />);
    fireEvent.load(screen.getByAltText('Art'));
    onStatusChange.mockClear();

    rerender(<ArtFrame sources={[`${A2}${FULL}`]} {...props} />);
    expect(onStatusChange).not.toHaveBeenCalledWith('loading');
  });
});
