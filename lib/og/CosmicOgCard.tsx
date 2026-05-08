/**
 * Shared brand template for every Open Graph card on the site.
 *
 * Why this exists:
 *   - SVGs are rejected by Discord, Slack, X, Facebook, and LinkedIn as
 *     `og:image`. We need an actual PNG byte stream, which `next/og`'s
 *     ImageResponse produces from JSX at edge-runtime build time.
 *   - The marketing host previously had its own card in
 *     `app/landing-site/opengraph-image.tsx`, but that route is rarely
 *     shared. The most-shared URL is the canonical site root, so we lift
 *     a single template here that every `opengraph-image.tsx` can reuse.
 *
 * Constraints (Satori, the renderer behind ImageResponse):
 *   - No Tailwind / no external CSS — only inline `style` props.
 *   - Every parent element with multiple children must declare
 *     `display: 'flex'` (Satori errors otherwise).
 *   - Font loading is intentionally skipped: Satori's Helvetica fallback
 *     is consistent across deploys and avoids the ~200 ms of edge-time
 *     font fetching.
 *
 * Visual language matches the landing-site `Hero` and the runtime
 * `ReducedMotionFallback` background — deep-space gradient with
 * nebula-violet, aurora-cyan, and chrono-rose radial glows.
 */

import type { ReactElement } from 'react';

export type CosmicOgCardProps = {
  /** Top-row label, all-caps with wide tracking. Defaults to "Cosmic Signature". */
  eyebrow?: string;
  /** Main headline. Use the brand line ("Every Gesture Shapes the Signature.") for default. */
  title: string;
  /** Single line of supporting copy under the headline. Optional. */
  subhead?: string;
  /** Bottom-left chips. Defaults to the three core protocol pillars. */
  chips?: readonly string[];
  /** Bottom-right text. Defaults to the canonical domain. */
  footerEnd?: string;
};

const DEFAULT_CHIPS = ['CC0', 'Formally Verified', '7% Protocol Guild'] as const;

/**
 * Background uses literal RGBA values rather than CSS `rgb(var(...))`
 * tokens because Satori does not resolve CSS custom properties.
 *
 * Colors mirror the brand tokens in `styles/tokens.css`:
 *   - nebula-violet 108 60 225
 *   - aurora-cyan   0 229 255
 *   - chrono-rose   255 61 138
 *   - cosmic-indigo-deep #0D0521 -> #1A0B3E
 */
const DEEP_SPACE_BACKGROUND =
  'radial-gradient(60% 40% at 15% 20%, rgba(108, 60, 225, 0.55) 0%, transparent 60%), ' +
  'radial-gradient(50% 60% at 100% 80%, rgba(0, 229, 255, 0.35) 0%, transparent 70%), ' +
  'radial-gradient(40% 40% at 75% 35%, rgba(255, 61, 138, 0.35) 0%, transparent 65%), ' +
  'linear-gradient(180deg, #0D0521 0%, #1A0B3E 100%)';

/** Standard Open Graph dimensions consumed by every embed. */
export const COSMIC_OG_SIZE = { width: 1200, height: 630 } as const;

export function CosmicOgCard({
  eyebrow = 'Cosmic Signature',
  title,
  subhead,
  chips = DEFAULT_CHIPS,
  footerEnd = 'cosmicsignature.com',
}: CosmicOgCardProps): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: DEEP_SPACE_BACKGROUND,
        color: '#F0EDFF',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #00E5FF, #6C3CE1)',
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.75)',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            opacity: 0.85,
          }}
        >
          {eyebrow}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            maxWidth: '1040px',
          }}
        >
          {title}
        </div>
        {subhead ? (
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              opacity: 0.72,
              maxWidth: '900px',
              lineHeight: 1.35,
            }}
          >
            {subhead}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 18,
          opacity: 0.65,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
        }}
      >
        <div style={{ display: 'flex', gap: '32px' }}>
          {chips.map((chip) => (
            <span key={chip} style={{ display: 'flex' }}>
              {chip}
            </span>
          ))}
        </div>
        {/* `flexShrink: 0` keeps the canonical domain stamp readable even
            when a route packs in long chip labels. Satori does not reflow
            text, so without this the chips would overrun the footer. */}
        <div style={{ display: 'flex', flexShrink: 0, marginLeft: '32px' }}>{footerEnd}</div>
      </div>
    </div>
  );
}
