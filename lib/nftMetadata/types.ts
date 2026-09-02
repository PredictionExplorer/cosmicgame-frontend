/**
 * Cosmic Signature token metadata (the ERC-721 `tokenURI` document served at
 * `{media origin}/metadata/{tokenId}`).
 *
 * Version 2 of the pipeline added OpenSea-style `attributes` (the art traits),
 * a `properties.generation` block (palette hues, finishes, symmetry), the
 * three-body `properties.simulation` record, and a `properties.media` package
 * manifest. Older tokens (and older API hosts) still serve the v1 shape with
 * only cycle / imprint attributes, so every field here is optional and the
 * document is parsed loosely: unknown keys pass through, and a malformed
 * attribute row is dropped rather than failing the whole document.
 */
import { z } from 'zod';

/** One OpenSea-style attribute row (`trait_type` / `value` / optional display hints). */
export const NftAttributeSchema = z
  .object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
    display_type: z.string().optional(),
    max_value: z.number().optional(),
  })
  .loose();

const MediaDetailsSchema = z
  .object({
    bytes: z.number().optional(),
    format: z.string().optional(),
    codec: z.string().optional(),
    duration_seconds: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    sha256: z.string().optional(),
  })
  .loose();

const PaletteSchema = z
  .object({
    family: z.string().optional(),
    spectral_class: z.string().optional(),
    body_base_hues_deg: z.array(z.number()).optional(),
    dominant_wavelength_nm: z.number().nullable().optional(),
    dispersion_deg: z.number().optional(),
    anchor_deg: z.number().optional(),
    dominant_body: z.number().optional(),
  })
  .loose();

const FinishesSchema = z
  .object({
    prism: z.boolean().optional(),
    stardust: z.boolean().optional(),
    prism_strength: z.number().optional(),
    stardust_count: z.number().optional(),
    halation_strength: z.number().optional(),
    diffraction_spikes: z.boolean().optional(),
  })
  .loose();

const BordaSchema = z
  .object({
    aesthetic_score: z.number().optional(),
    selection_score: z.number().optional(),
    selected_index: z.number().optional(),
    total_candidates: z.number().optional(),
    retry_count: z.number().optional(),
  })
  .loose();

const StructureSchema = z
  .object({
    primary: z.string().optional(),
    underlay: z
      .object({
        alpha: z.number().optional(),
        vocabulary: z.string().optional(),
      })
      .loose()
      .optional(),
    stack_label: z.string().optional(),
  })
  .loose();

const GenerationSchema = z
  .object({
    palette: PaletteSchema.optional(),
    finishes: FinishesSchema.optional(),
    borda: BordaSchema.optional(),
    structure: StructureSchema.optional(),
    symmetry: z.string().optional(),
    projection: z.string().optional(),
    wildcard: z.boolean().optional(),
    resolution: z.object({ width: z.number(), height: z.number() }).loose().optional(),
    visual_profile: z.string().optional(),
  })
  .loose();

const SimulationSchema = z
  .object({
    masses: z.array(z.number()).optional(),
    total_energy: z.number().optional(),
    angular_momentum: z.number().optional(),
    chaos_index: z.number().optional(),
    chaos_raw: z.number().optional(),
    chaos_cv: z.number().optional(),
    equilateralness: z.number().optional(),
    syzygy_count: z.number().optional(),
    integrator: z.string().optional(),
    steps: z.number().optional(),
    warmup_steps: z.number().optional(),
    dt: z.number().optional(),
    escape_threshold: z.number().optional(),
    closest_approach: z
      .object({
        pair: z.array(z.number()).optional(),
        step: z.number().optional(),
        distance: z.number().optional(),
      })
      .loose()
      .optional(),
    braid: z
      .object({
        word: z.string().optional(),
        crossings: z.number().optional(),
        truncated: z.boolean().optional(),
      })
      .loose()
      .optional(),
    fate: z
      .object({
        outcome: z.string().optional(),
        escaper: z.number().nullable().optional(),
        ejection_step: z.number().nullable().optional(),
        horizon_steps: z.number().optional(),
      })
      .loose()
      .optional(),
  })
  .loose();

const MediaSchema = z
  .object({
    web_image: z.string().optional(),
    preview_image: z.string().optional(),
    source_image: z.string().optional(),
    hq_video: z.string().optional(),
    spectral_sweep: z.string().optional(),
    spectral_sweep_hq: z.string().optional(),
    asset_manifest: z.string().optional(),
    trait_source: z.string().optional(),
    generation_records: z.string().optional(),
    spectral_bins: z.string().optional(),
  })
  .loose();

const PropertiesSchema = z
  .object({
    token_id: z.number().optional(),
    round_num: z.number().optional(), // lexicon-allow-backend-type
    seed: z.string().optional(),
    generation: GenerationSchema.optional(),
    simulation: SimulationSchema.optional(),
    media: MediaSchema.optional(),
  })
  .loose();

const DocumentSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    animation_url: z.string().optional(),
    external_url: z.string().optional(),
    background_color: z.string().optional(),
    metadata_version: z.string().optional(),
    // `attributes` is deliberately absent here: rows are validated one by one
    // in parseCosmicSignatureMetadata so a single odd attribute cannot
    // invalidate the whole document.
    image_details: MediaDetailsSchema.optional(),
    animation_details: MediaDetailsSchema.optional(),
    properties: PropertiesSchema.optional(),
  })
  .loose();

/** A validated attribute row. */
export type NftAttribute = z.infer<typeof NftAttributeSchema>;

/** The `properties.generation` block (v2 pipeline). */
export type NftGeneration = z.infer<typeof GenerationSchema>;

/** The `properties.simulation` block (v2 pipeline). */
export type NftSimulation = z.infer<typeof SimulationSchema>;

/** The `properties.media` package manifest (v2 pipeline). */
export type NftMediaLinks = z.infer<typeof MediaSchema>;

/** A parsed Cosmic Signature metadata document with attribute rows validated. */
export type CosmicSignatureMetadata = z.infer<typeof DocumentSchema> & {
  attributes: NftAttribute[];
};

/**
 * Parses an unknown JSON payload into a {@link CosmicSignatureMetadata}.
 * Returns `null` when the payload is not an object or fails the loose
 * document shape; invalid attribute rows are dropped individually.
 */
export function parseCosmicSignatureMetadata(raw: unknown): CosmicSignatureMetadata | null {
  const document = DocumentSchema.safeParse(raw);
  if (!document.success) return null;
  const rawAttributes = (raw as { attributes?: unknown }).attributes;
  const attributes: NftAttribute[] = [];
  if (Array.isArray(rawAttributes)) {
    for (const row of rawAttributes) {
      const parsed = NftAttributeSchema.safeParse(row);
      if (parsed.success) attributes.push(parsed.data);
    }
  }
  return { ...document.data, attributes };
}
