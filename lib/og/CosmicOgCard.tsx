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
 *   - strip: title above two or three plates with their token numbers. The
 *            gallery and participants holding several Signatures.
 *
 * Artwork is contained, never cropped, dimmed or overlaid (the art-ground
 * rule of the design direction). All text is 28px or larger so it stays
 * legible at the 400–500px width previews are shown at.
 *
 * Every block of text is measured in the embedded faces and set as explicit
 * lines (lib/og/layout.ts, `planCosmicOgCard`): each line is known to fit its
 * column and each stack its box before anything is drawn, and text that must
 * be cut ends on a whole sentence or a whole word with the locale's ellipsis.
 *
 * Satori constraints: inline styles only, `display: flex` on every element
 * with more than one child, no CSS variables, no `text-transform` (eyebrows
 * are uppercased in `lib/og/text.ts` with the locale's own rules).
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { SITE_NAME } from '@/utils/seo';

import {
  CLASH_DISPLAY_500,
  JETBRAINS_MONO_500,
  cssFontFamily,
  fontFamilies,
  type OgTypography,
} from './fonts';
import { fitList, fitStack, layoutBlock, type StackPlan, type TextBlock } from './layout';
import type { OgMeasure, OgTextFace, OgTextStyle } from './measure';
import { OG_ATMOSPHERE, OG_COLORS } from './palette';

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
  /** Measures text in the faces the card embeds (`createOgMeasure`). */
  measure: OgMeasure;
  /** The locale's ellipsis, for text cut to fit. */
  ellipsis: string;
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

const WIDTH = COSMIC_OG_SIZE.width;
const HEIGHT = COSMIC_OG_SIZE.height;
/** Plate card: the black plate's width; the render is contained in it. */
export const PLATE_WIDTH = 680;
/** Plate card: the wall label's inset from the plate's edges. */
const LABEL_INSET = 40;
const STRIP_GAP = 20;
const STRIP_PADDING_X = 64;
const STRIP_WIDTH = WIDTH - 2 * STRIP_PADDING_X;
const STRIP_PLATE_HEIGHT = Math.round(Math.floor((STRIP_WIDTH - 2 * STRIP_GAP) / 3) / ART_RATIO);

/** The 28px floor every line of card text respects. */
const SMALL_TEXT = 28;
const SMALL_LINE = 1.2;
const STACK_GAP = 22;
const FOOTER_GAP = 32;

/**
 * Room a text stack has between the wordmark and the footer of each layout,
 * with at least 28px of air above and below it (see each layout's padding).
 */
export const OG_TEXT_BOXES = {
  text: { width: WIDTH - 160, height: 341 },
  plate: { width: WIDTH - PLATE_WIDTH - 64 - 48, height: 381 },
  strip: { width: STRIP_WIDTH, height: 175 },
} as const;

const TITLE_SIZES = {
  text: [80, 72, 64, 56, 48],
  plate: [64, 58, 52, 46, 40],
  strip: [60, 54, 48, 42],
} as const;

/** Lines a title may take, and the fewer it takes when a smaller size allows. */
const TITLE_LINES = {
  text: { preferredLines: 2, maxLines: 3 },
  plate: { preferredLines: 3, maxLines: 4 },
  strip: { preferredLines: 1, maxLines: 2 },
} as const;

/** Subhead sizes by layout; the strip card has no subhead. */
const SUBHEAD_SIZES = { text: [32, 30, 28], plate: [28] } as const;

const MONO: OgTextFace = { families: fontFamilies([JETBRAINS_MONO_500]), weight: 500 };
const WORDMARK: OgTextFace = { families: fontFamilies([CLASH_DISPLAY_500]), weight: 500 };

/** The faces a locale's card sets each role in. */
function facesFor(typography: OgTypography, monoTitle: boolean) {
  const { cjk } = typography;
  const body = fontFamilies(typography.body);
  return {
    title: monoTitle
      ? MONO
      : {
          families: fontFamilies(typography.display),
          weight: typography.displayWeight,
          letterSpacingEm: cjk ? 0 : -0.03,
          spaceFamilies: typography.titleSpaces && fontFamilies([typography.titleSpaces]),
        },
    eyebrow: { families: body, weight: 500, letterSpacingEm: cjk ? 0 : 0.12 },
    body: { families: body, weight: 400 },
    label: { families: body, weight: 500 },
  } satisfies Record<string, OgTextFace>;
}

function lineHeights(typography: OgTypography, monoTitle: boolean) {
  return {
    title: typography.cjk ? 1.22 : monoTitle ? 1.12 : 1.04,
    subhead: typography.cjk ? 1.55 : 1.36,
  };
}

type Layout = keyof typeof OG_TEXT_BOXES;

/** What a card draws, laid out: which layout, and every block of text as lines. */
export type OgCardPlan =
  | { layout: 'text'; stack: StackPlan; fact: string }
  | { layout: 'plate'; stack: StackPlan; plate: OgPlate; label?: TextBlock }
  | { layout: 'strip'; stack: StackPlan; plates: readonly OgPlate[] };

function planStack(props: CosmicOgCardProps, layout: Layout): StackPlan {
  const { typography, measure, ellipsis, eyebrow, title, subhead, monoTitle = false } = props;
  const faces = facesFor(typography, monoTitle);
  const heights = lineHeights(typography, monoTitle);
  return fitStack(
    {
      ...OG_TEXT_BOXES[layout],
      gap: STACK_GAP,
      ellipsis,
      eyebrow: eyebrow
        ? {
            spec: {
              text: eyebrow,
              face: faces.eyebrow,
              lineBreak: typography.subheadBreak,
              lineHeight: SMALL_LINE,
            },
            size: SMALL_TEXT,
            maxLines: 2,
          }
        : undefined,
      title: {
        spec: {
          text: title,
          face: faces.title,
          lineBreak: monoTitle ? 'anywhere' : typography.titleBreak,
          lineHeight: heights.title,
          textWrap: 'balance',
          // Chinese breaks between any two characters, so a break inside a
          // clause may split a word (以链 / 上种子): prefer one on a clause.
          keepClauses: typography.cjk && typography.titleBreak === 'anywhere' && !monoTitle,
        },
        sizes: TITLE_SIZES[layout],
        ...TITLE_LINES[layout],
      },
      subhead:
        subhead && layout !== 'strip'
          ? {
              spec: {
                text: subhead,
                face: faces.body,
                lineBreak: typography.subheadBreak,
                lineHeight: heights.subhead,
                textWrap: 'pretty',
              },
              sizes: SUBHEAD_SIZES[layout],
            }
          : undefined,
    },
    measure,
  );
}

const smallStyle = (face: OgTextFace): OgTextStyle => ({ ...face, size: SMALL_TEXT });

/** Lays the card out: the layout its art calls for, and every line of text it draws. */
export function planCosmicOgCard(props: CosmicOgCardProps): OgCardPlan {
  const art = props.art ?? [];
  if (art.length >= 2) {
    return { layout: 'strip', stack: planStack(props, 'strip'), plates: art.slice(0, 3) };
  }
  const { typography, measure, ellipsis } = props;
  const faces = facesFor(typography, props.monoTitle ?? false);
  const [plate] = art;
  if (plate) {
    const label = plate.label
      ? layoutBlock(
          {
            text: plate.label,
            face: faces.label,
            lineBreak: typography.subheadBreak,
            lineHeight: SMALL_LINE,
          },
          SMALL_TEXT,
          PLATE_WIDTH - 2 * LABEL_INSET,
          measure,
          { maxLines: 1, ellipsis },
        )
      : undefined;
    return { layout: 'plate', stack: planStack(props, 'plate'), plate, label };
  }
  const domainWidth = measure(props.domain, smallStyle(faces.body));
  const factWidth = OG_TEXT_BOXES.text.width - FOOTER_GAP - domainWidth;
  const fact = props.fact ? fitList(props.fact, smallStyle(faces.body), factWidth, measure) : '';
  return { layout: 'text', stack: planStack(props, 'text'), fact };
}

function faceStyle(face: OgTextFace): CSSProperties {
  return {
    fontFamily: cssFontFamily(face.families),
    fontWeight: face.weight,
    letterSpacing: face.letterSpacingEm ? `${face.letterSpacingEm}em` : 0,
  };
}

/** A laid-out block: one unwrapped line per row, exactly as measured. */
function Lines({
  block,
  face,
  color,
}: {
  block: TextBlock;
  face: OgTextFace;
  color: string;
}): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...faceStyle(face),
        fontSize: block.size,
        lineHeight: block.lineHeight,
        whiteSpace: 'nowrap',
        color,
      }}
    >
      {block.lines.map((line, index) => (
        <div key={index} style={{ display: 'flex' }}>
          {block.wordGap === undefined ? line : gappedWords(line, block.wordGap)}
        </div>
      ))}
    </div>
  );
}

/** A line's words, its spaces drawn as gaps of the measured width. */
function gappedWords(line: string, gap: number): ReactElement[] {
  const words = line.split(' ');
  return words.map((word, index) => (
    <span key={index} style={{ marginRight: index < words.length - 1 ? gap : 0 }}>
      {word}
    </span>
  ));
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
          ...faceStyle(WORDMARK),
          fontSize: size,
          letterSpacing: '-0.01em',
          color: OG_COLORS.text,
        }}
      >
        {SITE_NAME}
      </div>
    </div>
  );
}

function SmallText({
  face,
  children,
  align = 'left',
}: {
  face: OgTextFace;
  children: ReactNode;
  align?: 'left' | 'right';
}): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        ...faceStyle(face),
        fontSize: SMALL_TEXT,
        lineHeight: SMALL_LINE,
        whiteSpace: 'nowrap',
        color: OG_COLORS.subtle,
      }}
    >
      {children}
    </div>
  );
}

function TextStack({
  plan,
  typography,
  monoTitle,
  width,
}: {
  plan: StackPlan;
  typography: OgTypography;
  monoTitle: boolean;
  width: number;
}): ReactElement {
  const faces = facesFor(typography, monoTitle);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: STACK_GAP, width }}>
      {plan.eyebrow ? (
        <Lines block={plan.eyebrow} face={faces.eyebrow} color={OG_COLORS.subtle} />
      ) : null}
      <Lines block={plan.title} face={faces.title} color={OG_COLORS.text} />
      {plan.subhead ? (
        <Lines block={plan.subhead} face={faces.body} color={OG_COLORS.muted} />
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

function TextCard({
  props,
  stack,
  fact,
}: {
  props: CosmicOgCardProps;
  stack: StackPlan;
  fact: string;
}): ReactElement {
  const { typography, markSrc, monoTitle = false, domain } = props;
  const body = facesFor(typography, monoTitle).body;
  return (
    <div style={{ ...ground, flexDirection: 'column', padding: '64px 80px 60px' }}>
      <Wordmark markSrc={markSrc} />
      <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
        <TextStack
          plan={stack}
          typography={typography}
          monoTitle={monoTitle}
          width={OG_TEXT_BOXES.text.width}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: FOOTER_GAP,
          paddingTop: 28,
          borderTop: `1px solid ${OG_COLORS.rule}`,
        }}
      >
        <SmallText face={body}>{fact}</SmallText>
        <SmallText face={body} align="right">
          {domain}
        </SmallText>
      </div>
    </div>
  );
}

function PlateCard({
  props,
  stack,
  plate,
  label,
}: {
  props: CosmicOgCardProps;
  stack: StackPlan;
  plate: OgPlate;
  label?: TextBlock;
}): ReactElement {
  const { typography, markSrc, monoTitle = false, domain } = props;
  const faces = facesFor(typography, monoTitle);
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
          plan={stack}
          typography={typography}
          monoTitle={monoTitle}
          width={OG_TEXT_BOXES.plate.width}
        />
        <SmallText face={faces.body}>{domain}</SmallText>
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
        {label ? (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              left: LABEL_INSET,
              right: LABEL_INSET,
              bottom: 30,
            }}
          >
            <Lines block={label} face={faces.label} color={OG_COLORS.subtle} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Two or three plates across the full measure. Three fill it edge to edge; two
 * share it, each render contained in the middle of a wider plate, so the
 * strip never ends in an empty third.
 */
function stripPlateWidth(count: number): number {
  return Math.floor((STRIP_WIDTH - (count - 1) * STRIP_GAP) / count);
}

function StripCard({
  props,
  stack,
  plates,
}: {
  props: CosmicOgCardProps;
  stack: StackPlan;
  plates: readonly OgPlate[];
}): ReactElement {
  const { typography, markSrc, monoTitle = false, domain } = props;
  const faces = facesFor(typography, monoTitle);
  const plateWidth = stripPlateWidth(plates.length);
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
        <SmallText face={faces.body} align="right">
          {domain}
        </SmallText>
      </div>
      <TextStack plan={stack} typography={typography} monoTitle={monoTitle} width={STRIP_WIDTH} />
      <div style={{ display: 'flex', gap: STRIP_GAP }}>
        {plates.map((plate, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Plate plate={plate} width={plateWidth} height={STRIP_PLATE_HEIGHT} radius={2} />
            {plate.number ? <SmallText face={MONO}>{plate.number}</SmallText> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CosmicOgCard(props: CosmicOgCardProps): ReactElement {
  const plan = planCosmicOgCard(props);
  switch (plan.layout) {
    case 'strip':
      return <StripCard props={props} stack={plan.stack} plates={plan.plates} />;
    case 'plate':
      return <PlateCard props={props} stack={plan.stack} plate={plan.plate} label={plan.label} />;
    case 'text':
      return <TextCard props={props} stack={plan.stack} fact={plan.fact} />;
  }
}
