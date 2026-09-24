import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { InfoTooltip } from '@/components/ui/info-tooltip';

import NFTImage from './NFTImage';

interface NFTVideoProps {
  image_thumb: string;
  onClick: () => void;
}

/**
 * A still of the artwork with a play button that opens its animation.
 *
 * @deprecated The detail page plays the animation inside its own plate with
 * `SignatureViewer` (Still / In motion). This block remains for existing call
 * sites and is removed in wave 4. It no longer dims or scales the art, and the
 * whole poster is a labelled button, so it works from the keyboard.
 */
const NFTVideo = ({ image_thumb, onClick }: NFTVideoProps) => {
  const t = useTranslations('detail');

  return (
    <div data-testid="nft-video-section">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="type-heading-3 text-foreground">{t('video.watchAnimation')}</h3>
        <InfoTooltip content={t('video.watchAnimationTooltip')} />
      </div>
      <button
        type="button"
        onClick={onClick}
        className="group relative block w-full max-w-2xl cursor-pointer overflow-hidden rounded-edge focus-ring-inset"
        aria-label={t('video.watchAnimation')}
        data-testid="nft-video-play"
      >
        <NFTImage src={image_thumb} alt="" frame="signature" />
        <span
          aria-hidden
          className="absolute bottom-3 left-3 flex size-12 items-center justify-center rounded-full bg-art-ground/70 text-foreground ring-1 ring-rule transition-colors duration-[var(--duration-fast)] group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <Play className="ml-0.5 size-5" fill="currentColor" />
        </span>
      </button>
    </div>
  );
};

export default NFTVideo;
