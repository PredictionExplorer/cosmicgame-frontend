import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard, type CosmicOgCardProps } from './CosmicOgCard';
import { getOgFontConfig, getOgTypography } from './fonts';
import { orbitMarkDataUri } from './mark';
import { OG_COLORS } from './palette';
import { ogUppercase } from './text';

/** What a route puts on its card; typography, mark and fonts come from the locale. */
export type OgCardContent = Omit<CosmicOgCardProps, 'typography' | 'markSrc'>;

/** Renders one share card as a 1200×630 PNG in the locale's faces. */
export async function createCosmicOgImage(
  locale: string | undefined,
  content: OgCardContent,
): Promise<ImageResponse> {
  const typography = getOgTypography(locale);
  const eyebrow =
    content.eyebrow && !typography.cjk ? ogUppercase(content.eyebrow, locale) : content.eyebrow;

  return new ImageResponse(
    <CosmicOgCard
      {...content}
      eyebrow={eyebrow}
      typography={typography}
      markSrc={orbitMarkDataUri(OG_COLORS.mark)}
    />,
    { ...COSMIC_OG_SIZE, fonts: await getOgFontConfig(locale) },
  );
}
