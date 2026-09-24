'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  resolveTraitTypeLabel,
  resolveTraitValueLabel,
  toSpectralClass,
  type CategoricalTraitKey,
  type TraitKey,
  type TraitTranslator,
} from '@/lib/nftMetadata';

export { camelTraitKey, resolveTraitValueLabel, type TraitTranslator } from '@/lib/nftMetadata';

/** Localized helpers for trait type labels, hints, and values. */
export interface TraitLabels {
  typeLabel: (key: TraitKey) => string;
  typeHint: (key: TraitKey) => string;
  valueLabel: (key: CategoricalTraitKey, raw: string) => string;
  /** Colour description of a spectral class ("Blue-white"), or null when unknown. */
  spectralTone: (value: string | undefined | null) => string | null;
}

/**
 * The `traits` catalog as the untyped `TraitTranslator` the label helpers in
 * `@/lib/nftMetadata` take (their keys are composed at run time). The one
 * place the typed next-intl translator is widened; client code calls this
 * instead of casting.
 */
export function useTraitTranslator(): TraitTranslator {
  return useTranslations('traits') as unknown as TraitTranslator;
}

/** Hook exposing the `traits` catalog through trait-aware label helpers. */
export function useTraitLabels(): TraitLabels {
  const t = useTraitTranslator();
  const typeLabel = useCallback((key: TraitKey) => resolveTraitTypeLabel(t, key), [t]);
  const typeHint = useCallback((key: TraitKey) => t(`hints.${key}`), [t]);
  const valueLabel = useCallback(
    (key: CategoricalTraitKey, raw: string) => resolveTraitValueLabel(t, key, raw),
    [t],
  );
  const spectralTone = useCallback(
    (value: string | undefined | null) => {
      const spectralClass = toSpectralClass(value);
      return spectralClass ? t(`values.spectralClass.${spectralClass}.tone`) : null;
    },
    [t],
  );
  return useMemo(
    () => ({ typeLabel, typeHint, valueLabel, spectralTone }),
    [typeLabel, typeHint, valueLabel, spectralTone],
  );
}
