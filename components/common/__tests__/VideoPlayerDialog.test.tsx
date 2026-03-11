import { render } from '@/test-utils';

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
});
