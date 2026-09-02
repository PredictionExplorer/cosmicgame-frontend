import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard, type CosmicOgCardProps } from './CosmicOgCard';
import { getOgFontConfig, getOgTypography } from './fonts';

export async function createCosmicOgImage(
  locale: string | undefined,
  props: CosmicOgCardProps,
): Promise<ImageResponse> {
  const typography = getOgTypography(locale);
  const fonts = await getOgFontConfig(locale);

  return new ImageResponse(
    <CosmicOgCard {...props} cjk={typography.cjk} fontFamily={typography.font?.name} />,
    {
      ...COSMIC_OG_SIZE,
      ...(fonts.length > 0 ? { fonts } : {}),
    },
  );
}
