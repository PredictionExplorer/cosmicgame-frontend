import { useCallback } from 'react';

import {
  resolveTraitValueLabel,
  toSpectralClass,
  type NftTraitEntry,
  type TraitTranslator,
} from '@/lib/nftMetadata';

import { useTraitTranslator } from './traits/useTraitLabels';

export {
  RENDER_WINDOW_SECONDS,
  SIGNATURE_THUMB_WIDTH,
  isRenderPending,
  signatureMedia,
  signatureSources,
  type SignatureMedia,
} from './signatureMedia';

export interface SignatureAltInput {
  /** The formatted token number, e.g. `#000025`. */
  id: string;
  /** The token's name, when it has one. */
  name?: string | null;
  /** The token's traits, when the metadata has been published. */
  entry?: NftTraitEntry | null;
}

/**
 * Alt text composed from a Signature's traits, in the locale of the `traits`
 * translator: `“Twisted Mind”, Cosmic Signature #000025: Orbit Ribbons
 * structure, Solar Mono palette, spectral class G`. Each part appears only
 * when it is known; without traits it is the name and number alone.
 */
export function composeSignatureAlt(t: TraitTranslator, { id, name, entry }: SignatureAltInput) {
  const trimmedName = name?.trim();
  const subject = trimmedName
    ? t('alt.subjectNamed', { name: trimmedName, id })
    : t('quickView.title', { id });
  if (!entry?.structure || !entry.palette) return subject;

  const structure = resolveTraitValueLabel(t, 'structure', entry.structure);
  const palette = resolveTraitValueLabel(t, 'palette', entry.palette);
  const spectralClass = toSpectralClass(entry.spectralClass);
  return spectralClass
    ? t('alt.withTraitsAndClass', { subject, structure, palette, spectralClass })
    : t('alt.withTraits', { subject, structure, palette });
}

/**
 * `composeSignatureAlt` bound to the active locale's `traits` catalog, for
 * client components: `const signatureAlt = useSignatureAlt();` then
 * `signatureAlt({ id, name, entry })`.
 */
export function useSignatureAlt(): (input: SignatureAltInput) => string {
  const t = useTraitTranslator();
  return useCallback((input: SignatureAltInput) => composeSignatureAlt(t, input), [t]);
}
