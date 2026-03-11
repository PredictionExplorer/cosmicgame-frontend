import { renderHook } from '@testing-library/react';

import { useRWLKNFT } from '../useRWLKNFT';

const mockUseTokenInfo = jest
  .fn()
  .mockReturnValue({ data: undefined, isLoading: false, error: null });

jest.mock('../useApiQuery', () => ({
  useTokenInfo: (...args: unknown[]) => mockUseTokenInfo(...args),
}));

jest.mock('../../utils', () => ({
  getRWLKImageUrl: (fileName: string, suffix: string) => `https://cdn/${fileName}/${suffix}`,
}));

beforeEach(() => jest.clearAllMocks());

describe('useRWLKNFT', () => {
  it('returns null when tokenId is null', () => {
    const { result } = renderHook(() => useRWLKNFT(null));
    expect(result.current).toBeNull();
  });

  it('returns null when info is not yet loaded', () => {
    mockUseTokenInfo.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const { result } = renderHook(() => useRWLKNFT(42));
    expect(result.current).toBeNull();
  });

  it('returns RWLKNFTData when info is loaded', () => {
    mockUseTokenInfo.mockReturnValue({
      data: { CurName: 'MyNFT', CurOwnerAddr: '0xOwner', SeedHex: '0xSeed' },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRWLKNFT(42));

    expect(result.current).toEqual({
      id: 42,
      name: 'MyNFT',
      owner: '0xOwner',
      seed: '0xSeed',
      white_image: 'https://cdn/000042/white.png',
      white_image_thumb: 'https://cdn/000042/white_thumb.jpg',
      white_single_video: 'https://cdn/000042/white_single.mp4',
      white_triple_video: 'https://cdn/000042/white_triple.mp4',
      black_image: 'https://cdn/000042/black.png',
      black_image_thumb: 'https://cdn/000042/black_thumb.jpg',
      black_single_video: 'https://cdn/000042/black_single.mp4',
      black_triple_video: 'https://cdn/000042/black_triple.mp4',
    });
  });

  it('generates all 8 image/video URL variants', () => {
    mockUseTokenInfo.mockReturnValue({
      data: { CurName: 'T', CurOwnerAddr: '0x1', SeedHex: '0xA' },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRWLKNFT(5));
    const data = result.current!;

    expect(data.white_image).toContain('white.png');
    expect(data.white_image_thumb).toContain('white_thumb.jpg');
    expect(data.white_single_video).toContain('white_single.mp4');
    expect(data.white_triple_video).toContain('white_triple.mp4');
    expect(data.black_image).toContain('black.png');
    expect(data.black_image_thumb).toContain('black_thumb.jpg');
    expect(data.black_single_video).toContain('black_single.mp4');
    expect(data.black_triple_video).toContain('black_triple.mp4');
  });

  it('pads the filename to 6 digits', () => {
    mockUseTokenInfo.mockReturnValue({
      data: { CurName: '', CurOwnerAddr: '', SeedHex: '' },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRWLKNFT(7));
    expect(result.current?.white_image).toBe('https://cdn/000007/white.png');
  });

  it('handles tokenId 0 as a valid falsy number', () => {
    mockUseTokenInfo.mockReturnValue({
      data: { CurName: 'Zero', CurOwnerAddr: '0x0', SeedHex: '0x0' },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRWLKNFT(0));

    expect(result.current).not.toBeNull();
    expect(result.current?.id).toBe(0);
    expect(result.current?.white_image).toBe('https://cdn/000000/white.png');
  });

  it('handles large tokenId beyond 6 digits', () => {
    mockUseTokenInfo.mockReturnValue({
      data: { CurName: 'Big', CurOwnerAddr: '0xB', SeedHex: '0xC' },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRWLKNFT(1234567));
    expect(result.current?.id).toBe(1234567);
    expect(result.current?.white_image).toBe('https://cdn/1234567/white.png');
  });

  it('handles string tokenId', () => {
    mockUseTokenInfo.mockReturnValue({
      data: { CurName: 'X', CurOwnerAddr: '0x1', SeedHex: '0x2' },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRWLKNFT('123'));
    expect(result.current?.id).toBe(123);
    expect(result.current?.white_image).toBe('https://cdn/000123/white.png');
  });

  it('defaults name and owner to empty strings when null', () => {
    mockUseTokenInfo.mockReturnValue({
      data: { CurName: null, CurOwnerAddr: null, SeedHex: null },
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRWLKNFT(1));
    expect(result.current?.name).toBe('');
    expect(result.current?.owner).toBe('');
    expect(result.current?.seed).toBe('');
  });

  it('passes tokenId to useTokenInfo', () => {
    mockUseTokenInfo.mockReturnValue({ data: undefined, isLoading: false, error: null });
    renderHook(() => useRWLKNFT(99));
    expect(mockUseTokenInfo).toHaveBeenCalledWith(99);
  });

  it('memoises result when tokenId and info are unchanged across renders', () => {
    const info = { CurName: 'Stable', CurOwnerAddr: '0xS', SeedHex: '0xD' };
    mockUseTokenInfo.mockReturnValue({ data: info, isLoading: false, error: null });

    const { result, rerender } = renderHook(() => useRWLKNFT(10));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('returns fresh data when info changes between renders', () => {
    const info1 = { CurName: 'V1', CurOwnerAddr: '0x1', SeedHex: '0xA' };
    const info2 = { CurName: 'V2', CurOwnerAddr: '0x2', SeedHex: '0xB' };

    mockUseTokenInfo.mockReturnValue({ data: info1, isLoading: false, error: null });
    const { result, rerender } = renderHook(() => useRWLKNFT(10));
    const first = result.current;
    expect(first?.name).toBe('V1');

    mockUseTokenInfo.mockReturnValue({ data: info2, isLoading: false, error: null });
    rerender();
    expect(result.current?.name).toBe('V2');
    expect(result.current).not.toBe(first);
  });
});
