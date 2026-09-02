/**
 * `subset-font` ships no type declarations. Only the surface used by
 * scripts/build-og-fonts.ts is declared here (see its README for the rest).
 */
declare module 'subset-font' {
  interface VariationAxisRange {
    min?: number;
    max?: number;
    default?: number;
  }

  interface SubsetFontOptions {
    targetFormat?: 'sfnt' | 'woff' | 'woff2' | 'truetype';
    preserveNameIds?: number[];
    keepFeatures?: string[];
    variationAxes?: Record<string, number | VariationAxisRange>;
    noLayoutClosure?: boolean;
    glyphNames?: boolean;
    noHinting?: boolean;
    dropTables?: string[];
  }

  export default function subsetFont(
    buffer: Buffer,
    text: string,
    options?: SubsetFontOptions,
  ): Promise<Buffer>;
}
