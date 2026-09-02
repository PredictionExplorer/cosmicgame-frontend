/**
 * Real metadata documents captured from the production media origin
 * (`https://nfts.cosmicsignature.com/metadata/{id}`, pipeline v2.0.0) plus a
 * legacy v1 document from a dev host, for tests of the parser, the trait
 * normalizer, and the trait UI. Numbers are kept as published.
 */

/** Token #1 (named "NUMBA 1"): every optional trait present, Last CST Gesture allocation. */
export const TOKEN_1_METADATA_V2 = {
  animation_details: {
    bytes: 3003159,
    codec: 'h264',
    duration_seconds: 30,
    format: 'mp4',
    height: 2234,
    sha256: '3c7e40c44b00b69c3de1493512d10a58e9e8344a475ddc402289e6a6e5289a55',
    width: 3456,
  },
  animation_url:
    'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce.mp4',
  attributes: [
    { trait_type: 'Structure', value: 'Orbit Ribbons' },
    { trait_type: 'Underlay', value: 'Stipple Constellation' },
    { trait_type: 'Symmetry', value: 'Rosette ×4' },
    { trait_type: 'Projection', value: 'Phase Portrait' },
    { trait_type: 'Wildcard', value: 'Yes' },
    { trait_type: 'Palette', value: 'Glacial Split' },
    { trait_type: 'Spectral Class', value: 'B' },
    { trait_type: 'Mass Balance', value: 'Twin Binary' },
    { trait_type: 'Fate', value: 'Ejection' },
    { trait_type: 'Chaos', display_type: 'number', value: 22, max_value: 100 },
    { trait_type: 'Syzygies', display_type: 'number', value: 0 },
    { trait_type: 'Round', display_type: 'number', value: 0 }, // lexicon-allow-backend-type
    { trait_type: 'Imprinted', display_type: 'date', value: 1781506802 },
    { trait_type: 'Allocation', value: 'Last CST Gesture' },
  ],
  background_color: '000000',
  external_url: 'https://www.cosmicsignature.com/detail/1',
  image:
    'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce.png',
  image_details: {
    bytes: 2978826,
    format: 'png',
    height: 2234,
    sha256: 'fa54fe4f6a5f378fbb3b724e4d692ff5af500f8b88cbcba4ad948c99ce40b6ca',
    width: 3456,
  },
  metadata_version: '2.0.0',
  name: 'NUMBA 1',
  properties: {
    generation: {
      borda: {
        retry_count: 0,
        chaos_weight: 1,
        equil_weight: 4.346089218463906,
        selected_index: 50908,
        aesthetic_score: 0.9913475618978224,
        selection_score: 1.2113475618978224,
        total_candidates: 100000,
        weights_randomized: true,
      },
      drift: {
        mode: 'elliptical',
        scale: 1.2485573973037143,
        enabled: true,
        randomized: true,
        arc_fraction: 0.6306673618901324,
        orbit_eccentricity: 0.4187985081391527,
      },
      palette: {
        gate: 'gate1',
        family: 'Glacial Split',
        anchor_deg: 195.42043202931052,
        fingerprint: 'h195.4_d113.1_s+0.45_c0.70x0.57_l0.65w0.38_f1.74a8.5',
        dominant_body: 0,
        dispersion_deg: 113.06796711575143,
        spectral_class: 'B',
        body_base_hues_deg: [252.0917433511051, 144.71826439467338, 204.5146358327558],
        dominant_wavelength_nm: 476,
      },
      finishes: {
        prism: false,
        stardust: false,
        prism_strength: 0,
        stardust_count: 0,
        halation_strength: 0.21135579016375144,
        diffraction_spikes: false,
      },
      symmetry: 'dih4',
      wildcard: true,
      structure: {
        primary: 'Orbit Ribbons',
        underlay: { alpha: 0.18846198110695797, vocabulary: 'Stipple Constellation' },
        stack_label: 'orbit_ribbons+stipple_constellation@0.19',
        preferred_stack_label: 'orbit_ribbons+stipple_constellation@0.19',
      },
      projection: 'phase_portrait',
      resolution: { width: 3456, height: 2234 },
      visual_profile: 'cosmic_signature',
    },
    media: {
      asset_manifest:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/metadata/assets.json',
      generation_records:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/metadata/',
      hq_video:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/videos/hq/main.mp4',
      preview_image:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/images/web/preview.webp',
      source_image:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/images/source/master.png',
      spectral_bins:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/spectral/',
      spectral_sweep:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/videos/web/spectral_sweep.mp4',
      spectral_sweep_hq:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/videos/hq/spectral_sweep.mp4',
      trait_source:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/metadata/nft_traits.json',
      web_image:
        'https://nfts.cosmicsignature.com/images/new/cosmicsignature/0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce/images/web/full.webp',
    },
    round_num: 0, // lexicon-allow-backend-type
    seed: '0x36794583b610f71be4a51d19a01af5bfe05b673c31d86f3f0c3310c3e4261fce',
    simulation: {
      dt: 0.001,
      fate: { escaper: 0, outcome: 'ejection', ejection_step: 1350000, horizon_steps: 8000000 },
      braid: {
        word: "s2 s2 s1 s2 s2 s1 s2 s1 s2 s1 s2 s1' s1' s2 s1 s2 s1 s2 s1' s2 s1 s1 s2 s1 s2",
        crossings: 25,
        truncated: false,
      },
      steps: 1000000,
      masses: [106.18463169028465, 144.49214942581972, 162.31755403710375],
      chaos_cv: 218.92945162042534,
      chaos_raw: 178537.72959005344,
      integrator: 'yoshida4',
      chaos_index: 22,
      syzygy_count: 0,
      total_energy: -1613.8179817815758,
      warmup_steps: 1000000,
      equilateralness: 0.5752114818022617,
      angular_momentum: 67998.95277434646,
      closest_approach: { pair: [0, 1], step: 473503, distance: 4.533819457861163 },
      escape_threshold: -0.3,
    },
    token_id: 1,
  },
};

/** Token #7: a lean v2 document (no underlay / accent / finish), Stellar Selection allocation. */
export const TOKEN_7_METADATA_V2 = {
  attributes: [
    { trait_type: 'Structure', value: 'Time Chords' },
    { trait_type: 'Symmetry', value: 'Mirror' },
    { trait_type: 'Projection', value: 'Phase Portrait' },
    { trait_type: 'Palette', value: 'Glacial Split' },
    { trait_type: 'Spectral Class', value: 'F' },
    { trait_type: 'Mass Balance', value: 'Equal Trio' },
    { trait_type: 'Fate', value: 'Eternal Dance' },
    { trait_type: 'Chaos', display_type: 'number', value: 18, max_value: 100 },
    { trait_type: 'Syzygies', display_type: 'number', value: 0 },
    { trait_type: 'Round', display_type: 'number', value: 0 }, // lexicon-allow-backend-type
    { trait_type: 'Imprinted', display_type: 'date', value: 1781506802 },
    { trait_type: 'Allocation', value: 'Stellar Selection' },
  ],
  metadata_version: '2.0.0',
  name: 'Cosmic Signature #7',
  properties: {
    generation: {
      palette: {
        family: 'Glacial Split',
        spectral_class: 'F',
        body_base_hues_deg: [129.3, 309.1, 233.4],
        dominant_wavelength_nm: 482,
      },
    },
    round_num: 0, // lexicon-allow-backend-type
    seed: '0x2b31a0b9bd72a3a1f1cfe1e5c10a7aa1f0f1c3a2ba2e2a4bb7d9a47f1e6c9d21',
    token_id: 7,
  },
};

/** A v1 document as still served by older hosts: no art traits at all. */
export const TOKEN_43_METADATA_V1 = {
  animation_url:
    'https://devapi.cosmicsignature.com:8443/images/new/cosmicsignature/0x8d67b3fdfb3d625ea0fe8f7d9234ecf4875b45c99669ded64e93fe52c8a38de2.mp4',
  attributes: [
    { display_type: 'number', trait_type: 'Round', value: 0 }, // lexicon-allow-backend-type
    { display_type: 'date', trait_type: 'Imprinted', value: 1735689728 },
    {
      trait_type: 'seed',
      value: '8d67b3fdfb3d625ea0fe8f7d9234ecf4875b45c99669ded64e93fe52c8a38de2',
    },
  ],
  background_color: '000000',
  external_url: 'https://www.cosmicsignature.com/detail/43',
  image:
    'https://devapi.cosmicsignature.com:8443/images/new/cosmicsignature/0x8d67b3fdfb3d625ea0fe8f7d9234ecf4875b45c99669ded64e93fe52c8a38de2.png',
  name: 'Cosmic Signature #43',
  properties: {
    owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    round_num: 0, // lexicon-allow-backend-type
    seed: '8d67b3fdfb3d625ea0fe8f7d9234ecf4875b45c99669ded64e93fe52c8a38de2',
    token_id: 43,
  },
};
