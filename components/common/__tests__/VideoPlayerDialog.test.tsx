import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import VideoPlayerDialog from '../VideoPlayerDialog';

describe('VideoPlayerDialog', () => {
  it('renders video element when open with a videoPath', () => {
    render(<VideoPlayerDialog open={true} videoPath="/video.mp4" onClose={jest.fn()} />);
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/video.mp4');
  });

  it('renders video with controls and autoPlay', () => {
    render(<VideoPlayerDialog open={true} videoPath="/video.mp4" onClose={jest.fn()} />);
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('autoplay');
  });

  it('does not render video when videoPath is null', () => {
    render(<VideoPlayerDialog open={true} videoPath={null} onClose={jest.fn()} />);
    expect(document.querySelector('video')).not.toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<VideoPlayerDialog open={false} videoPath="/video.mp4" onClose={jest.fn()} />);
    expect(document.querySelector('video')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<VideoPlayerDialog open={true} videoPath="/video.mp4" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders video with the exact src passed as videoPath', () => {
    render(
      <VideoPlayerDialog
        open={true}
        videoPath="/media/cosmic-signature-42.webm"
        onClose={jest.fn()}
      />,
    );
    const video = document.querySelector('video');
    expect(video).toHaveAttribute('src', '/media/cosmic-signature-42.webm');
  });

  it('renders DialogContent when open even with null videoPath', () => {
    render(<VideoPlayerDialog open={true} videoPath={null} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has a visually hidden dialog title for screen readers', () => {
    render(<VideoPlayerDialog open={true} videoPath="/video.mp4" onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');
    const heading = dialog.querySelector('h2');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Video Player');
  });

  it('does not produce console.error about missing DialogTitle', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<VideoPlayerDialog open={true} videoPath="/video.mp4" onClose={jest.fn()} />);
    const titleWarnings = spy.mock.calls.filter((args) =>
      args.some((arg) => typeof arg === 'string' && arg.includes('DialogTitle')),
    );
    expect(titleWarnings).toHaveLength(0);
    spy.mockRestore();
  });

  it('does not produce console.warn about missing Description', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<VideoPlayerDialog open={true} videoPath="/video.mp4" onClose={jest.fn()} />);
    const descWarnings = spy.mock.calls.filter((args) =>
      args.some((arg) => typeof arg === 'string' && arg.includes('Description')),
    );
    expect(descWarnings).toHaveLength(0);
    spy.mockRestore();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <VideoPlayerDialog open={true} videoPath="/video.mp4" onClose={jest.fn()} />,
    );
    await checkA11y(container);
  }, 15_000);
});
