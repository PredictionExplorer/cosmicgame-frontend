import { useMemo } from 'react';

import { getRWLKImageUrl } from '@/utils';

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
    const fileName = tokenId.toString().padStart(6, '0');
    return {
      id: parseInt(tokenId.toString(), 10),
      name: info?.CurName || '',
      owner: info?.CurOwnerAddr || '',
      seed: info?.SeedHex || '',
      white_image: getRWLKImageUrl(fileName, 'white.png'),
      white_image_thumb: getRWLKImageUrl(fileName, 'white_thumb.jpg'),
      white_single_video: getRWLKImageUrl(fileName, 'white_single.mp4'),
      white_triple_video: getRWLKImageUrl(fileName, 'white_triple.mp4'),
      black_image: getRWLKImageUrl(fileName, 'black.png'),
      black_image_thumb: getRWLKImageUrl(fileName, 'black_thumb.jpg'),
      black_single_video: getRWLKImageUrl(fileName, 'black_single.mp4'),
      black_triple_video: getRWLKImageUrl(fileName, 'black_triple.mp4'),
    };
  }, [tokenId, info]);
};
