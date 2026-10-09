import { useMemo } from 'react';

import { randomWalkImageUrl } from '@/utils/urls';
import { useTokenInfo } from '@/hooks/useApiQuery';

export interface RWLKNFTData {
  id: number;
  name: string;
  owner: string;
  seed: string;
  white_image: string;
  white_image_thumb: string;
  white_single_video: string;
  white_triple_video: string;
  black_image: string;
  black_image_thumb: string;
  black_single_video: string;
  black_triple_video: string;
}

export const useRWLKNFT = (tokenId: number | string | null) => {
  const { data: info } = useTokenInfo(tokenId);

  return useMemo<RWLKNFTData | null>(() => {
    if (tokenId == null || !info) return null;
    const file = (variant: string) => randomWalkImageUrl(tokenId, variant);
    return {
      id: parseInt(tokenId.toString(), 10),
      name: info?.CurName || '',
      owner: info?.CurOwnerAddr || '',
      seed: info?.SeedHex || '',
      white_image: file('white.png'),
      white_image_thumb: file('white_thumb.jpg'),
      white_single_video: file('white_single.mp4'),
      white_triple_video: file('white_triple.mp4'),
      black_image: file('black.png'),
      black_image_thumb: file('black_thumb.jpg'),
      black_single_video: file('black_single.mp4'),
      black_triple_video: file('black_triple.mp4'),
    };
  }, [tokenId, info]);
};
