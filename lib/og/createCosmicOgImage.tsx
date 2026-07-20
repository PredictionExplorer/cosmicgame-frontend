import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard, type CosmicOgCardProps } from './CosmicOgCard';
import { resolveOgLocale } from './copy';
import { CJK_OG_FONT_NAME, getOgFontConfig } from './fonts';

export async function createCosmicOgImage(
  locale: string | undefined,
  props: CosmicOgCardProps,
): Promise<ImageResponse> {
  const resolvedLocale = resolveOgLocale(locale);
  const fonts = await getOgFontConfig(resolvedLocale);

  return new ImageResponse(
    <CosmicOgCard
      {...props}
      cjk={resolvedLocale === 'zh'}
      fontFamily={resolvedLocale === 'zh' ? CJK_OG_FONT_NAME : undefined}
    />,
    {
      ...COSMIC_OG_SIZE,
      ...(fonts.length > 0 ? { fonts } : {}),
    },
  );
}
