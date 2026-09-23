/**
 * The share-card family: every Open Graph image on both hosts is one of
 * three layouts on the Midnight ground (lib/og/palette.ts), with the orbit
 * mark and the site's own faces (lib/og/fonts.ts).
 *
 *   - text:  wordmark, eyebrow, title, subhead, one fact line. Routes whose
 *            subject is not an artwork, and every art card's fallback.
 *   - plate: a text column beside one Signature on its black plate, the
 *            wall label in the plate's lower band. Brand cards, token pages,
 *            a cycle's allocations, a participant with one Signature.
 *   - strip: title above up to three plates with their token numbers. The
 *            gallery and participants holding several Signatures.
 *
 * Artwork is contained, never cropped, dimmed or overlaid (the art-ground
 * rule of the design direction). All text is 28px or larger so it stays
 * legible at the 400–500px width previews are shown at, and every text
 * stack is sized to its box (lib/og/layout.ts) so nothing collides.
 *
 * Satori constraints: inline styles only, `display: flex` on every element
 * with more than one child, no CSS variables, no `text-transform` (eyebrows
 * are uppercased in `lib/og/text.ts` with the locale's own rules).
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';

import {
  CLASH_DISPLAY_500,
  JETBRAINS_MONO_500,
  fontFamily,
  type OgLineBreak,
  type OgTypography,
} from './fonts';
import { fitStack, type StackFit, type StackMetrics } from './layout';
import { OG_ATMOSPHERE, OG_COLORS } from './palette';
import { lineBreakUnits } from './text';

/** Standard Open Graph dimensions consumed by every embed. */
export const COSMIC_OG_SIZE = { width: 1200, height: 630 } as const;

/** Native aspect ratio of a Cosmic Signature render (3456 × 2234). */
export const ART_RATIO = 3456 / 2234;

export interface OgPlate {
  /** `data:` URI of the render. */
  src: string;
  /** Wall label in the plate's lower band: the name or `Signature #000047`, and the cycle. */
  label?: string;
  /** Token number under a strip plate: `#000047`. */
  number?: string;
}

export interface CosmicOgCardProps {
  typography: OgTypography;
  /** Tinted orbit mark (`orbitMarkDataUri`). */
  markSrc: string;
  eyebrow?: string;
  title: string;
  /** Sets the title in the mono face (addresses). */
  monoTitle?: boolean;
  subhead?: string;
  fact?: string;
  /** Host printed on the card: `app.cosmicsignature.com`. */
  domain: string;
  /** 0 → text card, 1 → plate card, 2–3 → strip card. */
  art?: readonly OgPlate[];
}

const BRAND = 'Cosmic Signature';
const WIDTH = COSMIC_OG_SIZE.width;
const HEIGHT = COSMIC_OG_SIZE.height;
/** Plate card: the black plate's width; the render is contained in it. */
export const PLATE_WIDTH = 680;
const STRIP_GAP = 20;
const STRIP_PADDING_X = 64;
const STRIP_PLATE_WIDTH = Math.floor((WIDTH - 2 * STRIP_PADDING_X - 2 * STRIP_GAP) / 3);

/** The 28px floor every line of card text respects. */
const SMALL_TEXT = 28;
const SMALL_LINE = 1.2;
const STACK_GAP = 22;

const MONO = fontFamily([JETBRAINS_MONO_500]);
const WORDMARK = fontFamily([CLASH_DISPLAY_500]);

function metricsFor(typography: OgTypography, monoTitle: boolean): StackMetrics {
  return {
    titleLineHeight: typography.cjk ? 1.22 : monoTitle ? 1.12 : 1.04,
    subheadLineHeight: typography.cjk ? 1.55 : 1.36,
    eyebrowBlock: SMALL_TEXT * SMALL_LINE + STACK_GAP,
    gap: STACK_GAP,
  };
}

/**
 * A block of text clamped to `lines`. Renderer-broken text gets an ellipsis;
 * word- and phrase-broken text is a wrapping row of unbreakable units (a
 * Korean word, a Japanese phrase), cut at the last whole line.
 */
function Clamped({
  text,
  mode,
  lines,
  style,
}: {
  text: string;
  mode: OgLineBreak;
  lines: number;
  style: CSSProperties & { fontSize: number; lineHeight: number };
}): ReactElement {
  const units = lineBreakUnits(text, mode);
  if (!units) {
    return <div style={{ display: 'block', lineClamp: lines, ...style }}>{text}</div>;
  }
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        maxHeight: Math.ceil(lines * style.fontSize * style.lineHeight),
        overflow: 'hidden',
        ...style,
      }}
    >
      {units.map((unit, index) => (
        <span key={index} style={{ display: 'flex', marginRight: unit.spaceAfter ? '0.28em' : 0 }}>
          {unit.text}
        </span>
      ))}
    </div>
  );
}

function Wordmark({ markSrc, size = 30 }: { markSrc: string; size?: number }): ReactElement {
  const mark = Math.round(size * 1.55);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.5) }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>; next/image does not exist there. */}
      <img src={markSrc} width={mark} height={mark} alt="" />
      <div
        style={{
          display: 'flex',
          fontFamily: WORDMARK,
          fontWeight: 500,
          fontSize: size,
          letterSpacing: '-0.01em',
          color: OG_COLORS.text,
        }}
      >
        {BRAND}
      </div>
    </div>
  );
}

function SmallText({
  typography,
  children,
  mono = false,
  weight = 400,
  align = 'left',
}: {
  typography: OgTypography;
  children: ReactNode;
  mono?: boolean;
  weight?: 400 | 500;
  align?: 'left' | 'right';
}): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        fontFamily: mono ? MONO : fontFamily(typography.body),
        fontWeight: weight,
        fontSize: SMALL_TEXT,
        lineHeight: SMALL_LINE,
        color: OG_COLORS.subtle,
      }}
    >
      {children}
    </div>
  );
}

interface TextStackProps {
  typography: OgTypography;
  eyebrow?: string;
  title: string;
  monoTitle: boolean;
  subhead?: string;
  width: number;
  fit: StackFit;
}

function TextStack({
  typography,
  eyebrow,
  title,
  monoTitle,
  subhead,
  width,
  fit,
}: TextStackProps): ReactElement {
  const { cjk } = typography;
  const metrics = metricsFor(typography, monoTitle);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: STACK_GAP, width }}>
      {eyebrow ? (
        <div
          style={{
            display: 'flex',
            fontFamily: fontFamily(typography.body),
            fontWeight: 500,
            fontSize: SMALL_TEXT,
            lineHeight: SMALL_LINE,
            letterSpacing: cjk ? 0 : '0.12em',
            color: OG_COLORS.subtle,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <Clamped
        text={title}
        mode={monoTitle ? 'anywhere' : typography.titleBreak}
        lines={fit.titleLines}
        style={{
          fontFamily: monoTitle ? MONO : fontFamily(typography.display),
          fontWeight: monoTitle ? 500 : typography.displayWeight,
          fontSize: fit.titleSize,
          lineHeight: metrics.titleLineHeight,
          letterSpacing: cjk || monoTitle ? 0 : '-0.03em',
          color: OG_COLORS.text,
        }}
      />
      {subhead && fit.subheadLines > 0 ? (
        <Clamped
          text={subhead}
          mode={typography.subheadBreak}
          lines={fit.subheadLines}
          style={{
            fontFamily: fontFamily(typography.body),
            fontWeight: 400,
            fontSize: fit.subheadSize,
            lineHeight: metrics.subheadLineHeight,
            color: OG_COLORS.muted,
          }}
        />
      ) : null}
    </div>
  );
}

function Plate({
  plate,
  width,
  height,
  radius = 0,
}: {
  plate: OgPlate;
  width: number;
  height: number;
  radius?: number;
}): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        background: OG_COLORS.plate,
        borderRadius: radius,
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>; next/image does not exist there. */}
      <img src={plate.src} width={width} height={height} style={{ objectFit: 'contain' }} alt="" />
    </div>
  );
}

const ground: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  backgroundColor: OG_COLORS.ground,
  backgroundImage: OG_ATMOSPHERE,
  color: OG_COLORS.text,
};

/** Room a text stack has between the wordmark and the footer of each layout. */
const TEXT_CARD = { width: WIDTH - 160, height: 341 };
const PLATE_CARD = { width: WIDTH - PLATE_WIDTH - 64 - 48, height: 381 };
const STRIP_CARD = { width: WIDTH - 2 * STRIP_PADDING_X, height: 175 };

function TextCard(props: CosmicOgCardProps): ReactElement {
  const { typography, markSrc, eyebrow, title, monoTitle = false, subhead, fact, domain } = props;
  const fit = fitStack(
    {
      title,
      titleBreak: typography.titleBreak,
      subhead,
      subheadBreak: typography.subheadBreak,
      hasEyebrow: Boolean(eyebrow),
      ...TEXT_CARD,
      titleSizes: [80, 72, 64, 56, 48],
      subheadSizes: [32, 30, 28],
      maxTitleLines: 3,
    },
    metricsFor(typography, monoTitle),
  );
  return (
    <div style={{ ...ground, flexDirection: 'column', padding: '64px 80px 60px' }}>
      <Wordmark markSrc={markSrc} />
      <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
        <TextStack
          typography={typography}
          eyebrow={eyebrow}
          title={title}
          monoTitle={monoTitle}
          subhead={subhead}
          width={TEXT_CARD.width}
          fit={fit}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 32,
          paddingTop: 28,
          borderTop: `1px solid ${OG_COLORS.rule}`,
        }}
      >
        <SmallText typography={typography}>{fact ?? ''}</SmallText>
        <SmallText typography={typography} align="right">
          {domain}
        </SmallText>
      </div>
    </div>
  );
}

function PlateCard(props: CosmicOgCardProps & { plate: OgPlate }): ReactElement {
  const { typography, markSrc, eyebrow, title, monoTitle = false, subhead, domain, plate } = props;
  const fit = fitStack(
    {
      title,
      titleBreak: typography.titleBreak,
      subhead,
      subheadBreak: typography.subheadBreak,
      hasEyebrow: Boolean(eyebrow),
      ...PLATE_CARD,
      titleSizes: [64, 58, 52, 46, 40],
      subheadSizes: [28],
      maxTitleLines: 4,
    },
    metricsFor(typography, monoTitle),
  );
  return (
    <div style={{ ...ground, flexDirection: 'row' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: WIDTH - PLATE_WIDTH,
          padding: '60px 48px 56px 64px',
        }}
      >
        <Wordmark markSrc={markSrc} size={28} />
        <TextStack
          typography={typography}
          eyebrow={eyebrow}
          title={title}
          monoTitle={monoTitle}
          subhead={subhead}
          width={PLATE_CARD.width}
          fit={fit}
        />
        <SmallText typography={typography}>{domain}</SmallText>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: PLATE_WIDTH,
          height: HEIGHT,
          background: OG_COLORS.plate,
          position: 'relative',
        }}
      >
        <Plate plate={plate} width={PLATE_WIDTH} height={Math.round(PLATE_WIDTH / ART_RATIO)} />
        {plate.label ? (
          <div style={{ display: 'flex', position: 'absolute', left: 40, right: 40, bottom: 30 }}>
            <SmallText typography={typography} weight={500}>
              {plate.label}
            </SmallText>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StripCard(props: CosmicOgCardProps & { plates: readonly OgPlate[] }): ReactElement {
  const { typography, markSrc, eyebrow, title, monoTitle = false, domain, plates } = props;
  const fit = fitStack(
    {
      title,
      titleBreak: typography.titleBreak,
      subheadBreak: typography.subheadBreak,
      hasEyebrow: Boolean(eyebrow),
      ...STRIP_CARD,
      titleSizes: [60, 54, 48, 42],
      subheadSizes: [28],
      maxTitleLines: 2,
    },
    metricsFor(typography, monoTitle),
  );
  const plateHeight = Math.round(STRIP_PLATE_WIDTH / ART_RATIO);
  return (
    <div
      style={{
        ...ground,
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: `52px ${STRIP_PADDING_X}px 44px`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark markSrc={markSrc} size={28} />
        <SmallText typography={typography} align="right">
          {domain}
        </SmallText>
      </div>
      <TextStack
        typography={typography}
        eyebrow={eyebrow}
        title={title}
        monoTitle={monoTitle}
        width={STRIP_CARD.width}
        fit={fit}
      />
      <div style={{ display: 'flex', gap: STRIP_GAP }}>
        {plates.slice(0, 3).map((plate, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Plate plate={plate} width={STRIP_PLATE_WIDTH} height={plateHeight} radius={2} />
            {plate.number ? (
              <SmallText typography={typography} mono weight={500}>
                {plate.number}
              </SmallText>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CosmicOgCard(props: CosmicOgCardProps): ReactElement {
  const art = props.art ?? [];
  if (art.length >= 2) return <StripCard {...props} plates={art} />;
  const [plate] = art;
  if (plate) return <PlateCard {...props} plate={plate} />;
  return <TextCard {...props} />;
}
