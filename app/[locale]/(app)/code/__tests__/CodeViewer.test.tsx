import { IMAGE_GENERATION_IPFS_CID, IMAGE_GENERATION_IPFS_URL } from '@/content/code/structure';

import { act, checkA11y, fireEvent, render, screen } from '@/test-utils';

import CodeViewer from '../CodeViewer';
import { RenderPipeline } from '../RenderPipeline';
import { COSMIC_SIGNATURE_CODE } from '../cosmicSignatureCode';

const mockCopy = jest.fn(async (_text: string) => undefined);
jest.mock('@/hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

const LINE_COUNT = COSMIC_SIGNATURE_CODE.split('\n').length;

describe('CodeViewer', () => {
  beforeEach(() => mockCopy.mockClear());

  it('titles the section in sentence case and says what the program does', () => {
    render(<CodeViewer />);
    expect(screen.getByRole('heading', { level: 2, name: 'Code viewer' })).toBeInTheDocument();
    expect(screen.getByText(/turns each seed into its image and video/)).toBeInTheDocument();
  });

  it('renders every line of the file, each addressable by its number', () => {
    const { container } = render(<CodeViewer />);
    const lines = container.querySelectorAll('[data-line-code]');
    expect(lines).toHaveLength(LINE_COUNT);
    expect(container.querySelector('#L1')?.textContent).toContain('extern crate nalgebra');
    expect(container.querySelector(`a[href="#L${LINE_COUNT}"]`)).not.toBeNull();
  });

  it('colours the Rust it shows', () => {
    const { container } = render(<CodeViewer />);
    const firstLine = container.querySelector('#L1 [data-line-code]');
    const keyword = Array.from(firstLine?.querySelectorAll('span') ?? []).find(
      (span) => span.textContent === 'extern',
    );
    expect(keyword).toHaveClass('text-secondary');
  });

  it('keeps line numbers out of the accessibility tree and the tab order', () => {
    const { container } = render(<CodeViewer />);
    const number = container.querySelector('a[href="#L1"]');
    expect(number).toHaveAttribute('aria-hidden', 'true');
    expect(number).toHaveAttribute('tabindex', '-1');
  });

  it('is a named, focusable scroll region, so the keyboard can scroll it', () => {
    render(<CodeViewer />);
    const region = screen.getByRole('region', { name: 'Image generation source code in Rust' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.className).toContain('max-h-[70vh]');
    expect(region.className).toContain('overflow-auto');
  });

  it('wraps lines on request', () => {
    render(<CodeViewer />);
    const region = screen.getByRole('region', { name: 'Image generation source code in Rust' });
    const toggle = screen.getByRole('button', { name: 'Wrap lines' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(region).toHaveAttribute('data-wrap', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(region).toHaveAttribute('data-wrap', 'true');
  });

  it('copies the code alone, without the line numbers', async () => {
    render(<CodeViewer />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    });
    expect(mockCopy).toHaveBeenCalledWith(COSMIC_SIGNATURE_CODE);
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
  });

  it('links the published copies and shows the IPFS identifier in full', () => {
    render(<CodeViewer />);
    expect(screen.getByRole('link', { name: /IPFS/ })).toHaveAttribute(
      'href',
      IMAGE_GENERATION_IPFS_URL,
    );
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/PredictionExplorer/CS-Image-Generation',
    );
    expect(screen.getByText(`ipfs://${IMAGE_GENERATION_IPFS_CID}`)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CodeViewer />);
    await checkA11y(container);
  });
});

describe('RenderPipeline', () => {
  it('shows the five steps in order, the last leading to the gallery', () => {
    const { container } = render(<RenderPipeline />);
    const steps = Array.from(container.querySelectorAll('ol > li')).map((li) =>
      li.getAttribute('data-step'),
    );
    expect(steps).toEqual(['seed', 'stream', 'simulation', 'renderer', 'image']);
    expect(screen.getByRole('heading', { level: 3, name: 'SHA3-256 random stream' })).toBeVisible();
    expect(screen.getByRole('link', { name: /See the images in the gallery/ })).toHaveAttribute(
      'href',
      '/gallery',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RenderPipeline />);
    await checkA11y(container);
  });
});
