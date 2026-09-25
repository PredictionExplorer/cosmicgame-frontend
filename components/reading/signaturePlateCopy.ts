import { getTranslations } from 'next-intl/server';

import { formatId } from '@/utils/format/ids';

import type { SignaturePlateCopy } from './SignaturePlate';
import type { SignaturePlateArt } from './signaturePlates';

/**
 * The wall label of a bundled Signature on a reading page, by the rule the
 * home page's plates follow (components/landing-v2/signatureLabel): the
 * title "Signature #000013" (the number set in mono by SignaturePlate), then
 * "Cycle 0". One artwork is named the same way everywhere on the landing
 * host; the alt text keeps the full "Cosmic Signature #000013".
 */
export async function getSignaturePlateCopy(
  locale: string,
): Promise<(art: SignaturePlateArt) => SignaturePlateCopy> {
  const [landing, traits, detail] = await Promise.all([
    getTranslations({ locale, namespace: 'landing' }),
    getTranslations({ locale, namespace: 'traits' }),
    getTranslations({ locale, namespace: 'detail' }),
  ]);
  const unavailable = detail('image.artworkUnavailable');
  return (art) => {
    const tokenLabel = formatId(art.tokenId);
    return {
      alt: traits('quickView.title', { id: tokenLabel }),
      title: landing('artwork.untitled', { tokenLabel }),
      cycle: landing('timer.cycle.numbered', { number: art.cycle }),
      unavailable,
    };
  };
}
