import { mediaFailoverUrl } from '@/utils/urls';

import { fireEvent, render, screen, waitFor } from '@/test-utils';

import { InkImageView } from '../InkImageView';

jest.mock('@/utils/urls', () => ({
  ...jest.requireActual('@/utils/urls'),
  mediaFailoverUrl: jest.fn(() => null),
}));

const image = {
  url: 'https://media.example/ink.webp',
  sourceUrl: 'https://media.example/ink.png',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(mediaFailoverUrl).mockReturnValue(null);
});

describe('InkImageView', () => {
  it('loads the selected image within the parent stage and reports its paint status', async () => {
    const onStatusChange = jest.fn();
    const onOpenFullscreen = jest.fn();
    render(
      <InkImageView
        image={image}
        subject="Study"
        onStatusChange={onStatusChange}
        onOpenFullscreen={onOpenFullscreen}
      />,
    );
    const art = screen.getByRole('img', { name: 'detail.ink.imageLabel(subject=Study)' });
    expect(art).toHaveAttribute('src', image.url);
    expect(art).toHaveAttribute('loading', 'eager');
    expect(art).toHaveClass('h-full', 'w-full', 'object-contain');
    expect(screen.getByTestId('ink-image-view')).toHaveAttribute('aria-busy', 'true');
    expect(onStatusChange).toHaveBeenLastCalledWith('loading');
    fireEvent.load(art);
    await waitFor(() => expect(onStatusChange).toHaveBeenLastCalledWith('loaded'));
    expect(screen.getByTestId('ink-image-view')).not.toHaveAttribute('aria-busy');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(art);
    expect(onOpenFullscreen).toHaveBeenCalledTimes(1);
  });

  it('tries the PNG source, reports exhaustion, and resets to the WebP on Retry', () => {
    const onStatusChange = jest.fn();
    const onOpenFullscreen = jest.fn();
    render(
      <InkImageView
        image={image}
        subject="Study"
        onStatusChange={onStatusChange}
        onOpenFullscreen={onOpenFullscreen}
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', image.sourceUrl);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.imageError');
    expect(onStatusChange).toHaveBeenLastCalledWith('unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'detail.ink.retry' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', image.url);
    expect(onStatusChange).toHaveBeenLastCalledWith('loading');
    expect(onOpenFullscreen).not.toHaveBeenCalled();
  });

  it('exhausts a rendition and its mirror before advancing to the source image', () => {
    jest.mocked(mediaFailoverUrl).mockImplementation((url) => url.replace('media.', 'backup.'));
    render(<InkImageView image={image} subject="Study" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://backup.example/ink.webp');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', image.sourceUrl);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://backup.example/ink.png');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('status')).toHaveTextContent('detail.ink.imageError');
  });

  it('does not retry a duplicate source image before presenting recovery', () => {
    render(<InkImageView image={{ url: image.url, sourceUrl: image.url }} subject="Study" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'detail.ink.retry' })).toBeInTheDocument();
  });
});
