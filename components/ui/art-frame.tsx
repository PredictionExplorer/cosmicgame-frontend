'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
 * The art plate. Every Signature hangs on its own pure-black plate at the
 * native 3456:2234 ratio with object-fit: contain. Nothing overlays, crops,
 * dims, saturates or zooms the artwork: its caption lives in a WallLabel
 * below the plate (docs/design-system.md → Art).
 */

/** Native pixel width of every Cosmic Signature render. */
export const ART_WIDTH = 3456;
/** Native pixel height of every Cosmic Signature render. */
export const ART_HEIGHT = 2234;

/**
 * Classes that put a bare Signature `<img>` on its plate: the native ratio,
 * the black ground and `object-fit: contain`, so nothing is cropped and any
 * sub-pixel edge blends into the art's own black. `NFTImage` applies it with
 * `frame="signature"`; new code renders `ArtFrame`.
 */
export const SIGNATURE_ART_CLASS = 'aspect-art bg-art-ground object-contain';

/**
 * The plate and its 1px print edge. The edge is a pseudo-element above the
 * image (the plate's own inset shadow would sit under it) and brightens on
 * hover and keyboard focus: the plate's only interaction signal.
 */
export const ART_PLATE_CLASS = cn(
  'art-plate isolate',
  "after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:content-['']",
  'after:shadow-[var(--art-edge)] after:transition-shadow after:duration-[var(--duration-fast)]',
  'hover:after:shadow-[var(--art-edge-active)] focus-within:after:shadow-[var(--art-edge-active)]',
);

/** One rendition of an artwork: its URL and its pixel width. */
export interface ArtRendition {
  src: string;
  width: number;
}

/**
 * One step of an artwork's resolution chain: a single URL, or a responsive
 * set of renditions of the same image that the browser picks from by `sizes`.
 */
export type ArtSource = string | readonly ArtRendition[];

/** Where an artwork is in its resolution chain. */
export type ArtStatus = 'loading' | 'loaded' | 'unavailable';

function isUsable(source: ArtSource | null | undefined): source is ArtSource {
  if (typeof source === 'string') return source.length > 0;
  return Array.isArray(source) && source.some((rendition) => rendition.src.length > 0);
}

function sourceKey(source: ArtSource): string {
  return typeof source === 'string'
    ? source
    : source.map((rendition) => `${rendition.src} ${rendition.width}w`).join(',');
}

/** Renditions with a URL, narrowest first. */
function sortedRenditions(renditions: readonly ArtRendition[]): ArtRendition[] {
  return renditions
    .filter((rendition) => rendition.src.length > 0)
    .sort((a, b) => a.width - b.width);
}

/**
 * The `srcset` of a responsive set: each published file once, at its real
 * pixel width (`…/thumb_card.webp 640w, …/full.webp 3456w`), so the browser
 * weighs the files that exist against `sizes` and the pixel density.
 */
export function renditionSrcSet(renditions: readonly ArtRendition[]): string {
  return sortedRenditions(renditions)
    .map((rendition) => `${rendition.src} ${rendition.width}w`)
    .join(', ');
}

/** Remote URLs bypass the Next optimizer: arbitrary NFT hosts are not in remotePatterns. */
function isRemote(src: string): boolean {
  return src.startsWith('http');
}

interface ChainState {
  key: string;
  step: number;
  /** URLs that failed, so a later fallback equal to one of them is skipped. */
  failed: readonly string[];
  loaded: boolean;
}

/** The current step of a resolution chain and the handlers that advance it. */
export interface ArtSourceChain {
  /** The source to render now; `null` once every source has failed. */
  source: ArtSource | null;
  status: ArtStatus;
  /** Pass to the image's `onError`: moves on to the next source. */
  onError: (event: SyntheticEvent<HTMLImageElement>) => void;
  onLoad: () => void;
}

/**
 * Walks an artwork's sources in order. The first one renders, a failure moves
 * to the next, and the chain ends in `unavailable`; new sources start over.
 * A fallback equal to a URL that already failed (the rendition the browser
 * picked from a responsive set) is skipped rather than requested twice.
 */
export function useArtSourceChain(
  sources: readonly (ArtSource | null | undefined)[],
): ArtSourceChain {
  const usable = sources.filter(isUsable);
  const key = usable.map(sourceKey).join('|');
  const [state, setState] = useState<ChainState>({ key, step: 0, failed: [], loaded: false });

  let current = state;
  if (state.key !== key) {
    current = { key, step: 0, failed: [], loaded: false };
    setState(current);
  }

  let index = current.step;
  while (index < usable.length) {
    const candidate = usable[index];
    if (typeof candidate !== 'string' || !current.failed.includes(candidate)) break;
    index += 1;
  }
  const source = usable[index] ?? null;

  const onError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const failedUrl = image.currentSrc || image.getAttribute('src') || '';
    setState((previous) =>
      previous.key !== key || previous.step > index
        ? previous
        : {
            key,
            step: index + 1,
            failed: failedUrl ? [...previous.failed, failedUrl] : previous.failed,
            loaded: false,
          },
    );
  };

  const onLoad = () => {
    setState((previous) =>
      previous.key === key && !previous.loaded ? { ...previous, loaded: true } : previous,
    );
  };

  const status: ArtStatus = source === null ? 'unavailable' : current.loaded ? 'loaded' : 'loading';
  return { source, status, onError, onLoad };
}

export interface ArtImageProps {
  source: ArtSource;
  alt: string;
  /** The rendered width at each breakpoint, for the srcset choice. */
  sizes: string;
  /** Above the fold: load eagerly at high fetch priority. */
  priority?: boolean;
  /** Overrides the loading mode `priority` implies. */
  loading?: 'lazy' | 'eager';
  className?: string;
  style?: CSSProperties;
  onError: (event: SyntheticEvent<HTMLImageElement>) => void;
  onLoad?: () => void;
}

/**
 * An image that settled before hydration fired its load or error event
 * before React listened. Replaying it once the element is attached lets the
 * source chain move on (or mark the art loaded) either way; the chain's
 * handlers ignore a repeat.
 */
function replaySettledImage(image: HTMLImageElement | null): void {
  if (!image?.complete) return;
  image.dispatchEvent(new Event(image.naturalWidth > 0 ? 'load' : 'error'));
}

/**
 * One source of a chain. A responsive set is a plain `<img>` whose srcset
 * lists the published files at their real widths (the media server already
 * publishes every size, so the optimizer has nothing to add); a single file
 * is a next/image, through the optimizer when local and as is when remote.
 */
export function ArtImage({
  source,
  alt,
  sizes,
  priority = false,
  loading,
  className,
  style,
  onError,
  onLoad,
}: ArtImageProps) {
  const set = typeof source === 'string' ? null : sortedRenditions(source);
  const loadingMode = loading ?? (priority ? 'eager' : 'lazy');
  const fetchPriority = priority ? 'high' : undefined;

  if (set) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- the srcset is the published renditions at their real widths; next/image would invent widths for them.
      <img
        ref={replaySettledImage}
        src={set[0]?.src ?? ''}
        srcSet={renditionSrcSet(set)}
        sizes={sizes}
        alt={alt}
        width={ART_WIDTH}
        height={ART_HEIGHT}
        loading={loadingMode}
        fetchPriority={fetchPriority}
        decoding="async"
        onError={onError}
        onLoad={onLoad}
        // As next/image does: a broken image's alt text never flashes on the plate.
        className={cn('text-transparent', className)}
        style={style}
      />
    );
  }

  const src = source as string;
  return (
    <Image
      src={src}
      unoptimized={isRemote(src)}
      alt={alt}
      width={ART_WIDTH}
      height={ART_HEIGHT}
      sizes={sizes}
      loading={loadingMode}
      fetchPriority={fetchPriority}
      onError={onError}
      onLoad={onLoad}
      className={className}
      style={style}
    />
  );
}

export interface OrbitMarkProps {
  className?: string;
}

/**
 * The orbit mark as a hairline: three orbits and their bodies. It stands in
 * for artwork that has not arrived and never resembles a real Signature.
 */
export function OrbitMark({ className }: OrbitMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
      className={cn('text-foreground/15', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      data-testid="orbit-mark"
    >
      <ellipse cx="60" cy="60" rx="54" ry="19" vectorEffect="non-scaling-stroke" />
      <ellipse
        cx="60"
        cy="60"
        rx="54"
        ry="19"
        transform="rotate(60 60 60)"
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx="60"
        cy="60"
        rx="54"
        ry="19"
        transform="rotate(120 60 60)"
        vectorEffect="non-scaling-stroke"
      />
      <g fill="currentColor" stroke="none">
        <circle cx="114" cy="60" r="2.2" />
        <circle cx="33" cy="106.8" r="2.2" />
        <circle cx="42.2" cy="23.6" r="2.2" />
      </g>
    </svg>
  );
}

export interface PendingPlateProps {
  /**
   * What the plate stands for ("Artwork unavailable"). Shown under the mark at
   * `full` density and always part of the accessible description. Omit it for
   * a loading skeleton.
   */
  label?: string;
  /** A second caption line in mono, such as the token number. */
  detail?: ReactNode;
  /** The artwork's alt text, used as the plate's accessible name. */
  alt?: string;
  /** `compact` draws the mark alone, for thumbnails too small for a caption. */
  density?: 'full' | 'compact';
  /**
   * `signature` (default): the black art plate with the orbit mark.
   * `media`: a neutral well for RandomWalk and third-party NFT images.
   */
  variant?: 'signature' | 'media';
  /** Marks the plate as a loading skeleton (`aria-busy`). */
  busy?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * PendingPlate — the one designed state for artwork that is missing or still
 * rendering: a plate at the art's own ratio with the orbit mark drawn as a
 * hairline and a caption. It doubles as the layout-matched skeleton of art
 * grids and never looks like a real Signature.
 */
export function PendingPlate({
  label,
  detail,
  alt,
  density = 'full',
  variant = 'signature',
  busy = false,
  className,
  style,
}: PendingPlateProps) {
  const captionId = useId();
  const name = alt ?? label;
  const describedByCaption = Boolean(alt && label);
  const showCaption = density === 'full' && Boolean(label || detail);
  return (
    <div
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-describedby={describedByCaption ? captionId : undefined}
      aria-busy={busy || undefined}
      data-testid="pending-plate"
      className={cn(
        'relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden text-center',
        variant === 'signature'
          ? cn(ART_PLATE_CLASS, 'aspect-art')
          : 'aspect-video rounded-[inherit] bg-surface-sunken',
        className,
      )}
      style={style}
    >
      {variant === 'signature' ? (
        <OrbitMark
          className={cn(
            'w-auto shrink',
            density === 'full' ? 'h-[36%] max-h-40 min-h-8' : 'h-[48%] max-h-16',
          )}
        />
      ) : (
        <ImageOff aria-hidden className="size-6 shrink-0 text-subtle" />
      )}
      {showCaption ? (
        <p id={captionId} className="flex max-w-full flex-col items-center gap-0.5 px-3">
          {label ? <span className="type-label text-muted-foreground">{label}</span> : null}
          {detail ? <span className="type-mono text-subtle">{detail}</span> : null}
        </p>
      ) : describedByCaption ? (
        <span id={captionId} hidden>
          {label}
        </span>
      ) : null}
    </div>
  );
}

export interface ArtFrameProps {
  /**
   * The artwork's sources, tried in order: usually the responsive set of the
   * published renditions, then the full-size files as fallbacks.
   */
  sources: readonly (ArtSource | null | undefined)[];
  /** Alt text composed from the token's traits. */
  alt: string;
  /** The plate's rendered width at each breakpoint, for the srcset choice. */
  sizes: string;
  /** Above the fold: load eagerly at high fetch priority. */
  priority?: boolean;
  /**
   * Caption of the unavailable state ("Artwork unavailable"). Passed in, so
   * the primitive works on both hosts whatever catalogs a page loads.
   */
  unavailableLabel: string;
  /** Second caption line of the unavailable state, e.g. the token number. */
  unavailableDetail?: ReactNode;
  /** `compact` for thumbnails: the unavailable state draws the mark alone. */
  density?: 'full' | 'compact';
  /** Called when the chain changes state (loading, loaded, unavailable). */
  onStatusChange?: (status: ArtStatus) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * ArtFrame — a Signature on its black plate at the native ratio. It loads the
 * best rendition for the slot (srcset and sizes over the published files),
 * falls back through the full-size files, and ends in the designed
 * unavailable state. It takes no children, so nothing is ever layered over
 * the art: put the caption in a WallLabel below it.
 */
export function ArtFrame({
  sources,
  alt,
  sizes,
  priority = false,
  unavailableLabel,
  unavailableDetail,
  density = 'full',
  onStatusChange,
  className,
  style,
}: ArtFrameProps) {
  const chain = useArtSourceChain(sources);

  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  });
  useEffect(() => {
    onStatusChangeRef.current?.(chain.status);
  }, [chain.status]);

  if (chain.source === null) {
    return (
      <PendingPlate
        label={unavailableLabel}
        detail={unavailableDetail}
        alt={alt}
        density={density}
        className={className}
        style={style}
      />
    );
  }

  return (
    <div
      className={cn(ART_PLATE_CLASS, 'w-full', className)}
      style={style}
      data-testid="art-frame"
      data-status={chain.status}
    >
      {chain.status === 'loading' ? (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <OrbitMark className="h-[36%] max-h-40 w-auto" />
        </span>
      ) : null}
      <ArtImage
        source={chain.source}
        alt={alt}
        sizes={sizes}
        priority={priority}
        onError={chain.onError}
        onLoad={chain.onLoad}
        className="relative z-[1]"
      />
    </div>
  );
}

export interface ArtTagProps {
  children: ReactNode;
  /**
   * `neutral` (default): a hairline tag for a fact. `positive` and
   * `attention` add a 6px dot in the status colour for a value that can
   * change; the word always carries the meaning.
   */
  tone?: 'neutral' | 'positive' | 'attention';
  className?: string;
}

const TAG_DOT = {
  positive: 'bg-positive',
  attention: 'bg-attention',
} as const;

/** A wall-label tag: hairline outline, edge radius, caption type. At most two per label. */
export function ArtTag({ children, tone = 'neutral', className }: ArtTagProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-edge border border-rule px-1.5 py-px type-caption text-muted-foreground',
        className,
      )}
    >
      {tone === 'neutral' ? null : (
        <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', TAG_DOT[tone])} />
      )}
      {children}
    </span>
  );
}

export interface WallLabelMetaProps {
  /** Short facts in reading order (token number, cycle, year). Empty entries are dropped. */
  items: readonly ReactNode[];
  className?: string;
}

function isPresent(item: ReactNode): boolean {
  return item !== null && item !== undefined && item !== false && item !== '';
}

/** The caption line of a wall label: short facts separated by middle dots. */
export function WallLabelMeta({ items, className }: WallLabelMetaProps) {
  const present = items.filter(isPresent);
  if (present.length === 0) return null;
  return (
    <p
      className={cn(
        'flex flex-wrap items-baseline gap-x-2 gap-y-0.5 type-caption text-subtle',
        className,
      )}
    >
      {present.map((item, index) => (
        <span key={index} className="inline-flex items-baseline gap-2">
          {index > 0 ? <span aria-hidden>·</span> : null}
          {item}
        </span>
      ))}
    </p>
  );
}

export interface WallLabelProps {
  /** Line 1: the name, or the graceful unnamed form ("Cosmic Signature #000025"), at full contrast. */
  title: ReactNode;
  /** The title's element: a heading where the label heads a section, `p` in grids. */
  titleAs?: 'h1' | 'h2' | 'h3' | 'p';
  /** Line 2: token number, cycle, year. */
  meta?: readonly ReactNode[];
  /** Up to two ArtTags. */
  tags?: ReactNode;
  /** Line 3, on detail and focused views: structure · palette with the hue strip. */
  children?: ReactNode;
  /** `figcaption` inside a `<figure>` that holds the ArtFrame. */
  as?: 'figcaption' | 'div';
  className?: string;
}

/**
 * WallLabel — the placard under a plate and the one caption system for every
 * artwork: the name, then the token number, cycle and year, then (where there
 * is room) the traits line, then at most two tags.
 */
export function WallLabel({
  title,
  titleAs: Title = 'p',
  meta,
  tags,
  children,
  as: Root = 'div',
  className,
}: WallLabelProps) {
  return (
    <Root className={cn('flex min-w-0 flex-col gap-1', className)}>
      <Title className="type-body-md font-medium text-foreground [overflow-wrap:anywhere]">
        {title}
      </Title>
      {meta ? <WallLabelMeta items={meta} /> : null}
      {children}
      {tags ? <div className="mt-1 flex flex-wrap gap-1.5">{tags}</div> : null}
    </Root>
  );
}
