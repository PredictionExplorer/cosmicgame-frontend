import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { GradientBorder } from '@/components/styled';

import NFTImage from './NFTImage';

interface NFTVideoProps {
  image_thumb: string;
  onClick: () => void;
}

const NFTVideo = ({ image_thumb, onClick }: NFTVideoProps) => {
  const t = useTranslations('detail');

  return (
    <div data-testid="nft-video-section">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t('video.watchAnimation')}</h3>
        <InfoTooltip content={t('video.watchAnimationTooltip')} />
      </div>
      <GradientBorder className="max-w-2xl overflow-hidden">
        <div
          className="relative cursor-pointer group"
          onClick={onClick}
          data-testid="nft-video-play"
        >
          <div className="overflow-hidden">
            <NFTImage
              src={image_thumb}
              alt={t('image.defaultAlt')}
              className="opacity-60 transition-all duration-500 group-hover:opacity-80 group-hover:scale-[1.02]"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/30 group-hover:border-primary/40">
              <Play className="h-7 w-7 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      </GradientBorder>
    </div>
  );
};

export default NFTVideo;
