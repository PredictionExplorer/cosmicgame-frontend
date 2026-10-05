'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ART_HEIGHT,
  ART_WIDTH,
  ArtImage,
  PendingPlate,
  useArtSourceChain,
  type ArtSource,
} from '@/components/ui/art-frame';

const ART_RATIO = ART_WIDTH / ART_HEIGHT;

/** Pointer travel (px) that turns a press on the zoomed art into a drag instead of a click. */
const DRAG_THRESHOLD_PX = 4;

export interface ArtLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The artwork's sources, full size first. */
  sources: readonly ArtSource[];
  /** Alt text composed from the token's traits. */
  alt: string;
  /** The viewer's title: the name, or "Cosmic Signature #000025". */
  title: string;
  /** Caption of the unavailable state. */
  unavailableLabel: string;
  /**
   * The control that opened the viewer. Focus returns to it on close; the
   * dialog has no Radix trigger, because the plate opens it too.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/** Where to keep the zoom's focal point: a point of the art (0–1) under an offset of the viewport. */
interface FocalPoint {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  left: number;
  top: number;
  moved: boolean;
}

/** The part of an object-fit: contain image the art actually occupies. */
function contentBox(image: HTMLElement) {
  const rect = image.getBoundingClientRect();
  const width = Math.min(rect.width, rect.height * ART_RATIO);
  const height = width / ART_RATIO;
  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top + (rect.height - height) / 2,
    width,
    height,
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * ArtLightbox — the full-screen viewer. The page's lights go down to the art's
 * own black and the Signature fills the screen at its native ratio. Zoom goes
 * to the render's own pixels (at least twice the fitted size) around the point
 * that was selected; the zoomed art pans by dragging, by touch scrolling, or
 * with the arrow keys. Focus stays inside, Esc closes and returns focus, and
 * +, - and 0 zoom from the keyboard.
 */
export function ArtLightbox({
  open,
  onOpenChange,
  sources,
  alt,
  title,
  unavailableLabel,
  returnFocusRef,
}: ArtLightboxProps) {
  const t = useTranslations('detail');
  const tCommon = useTranslations('common');
  const hintId = useId();
  const chain = useArtSourceChain(sources);
  const regionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const focalPoint = useRef<FocalPoint | null>(null);
  const drag = useRef<DragState | null>(null);
  const [zoomWidth, setZoomWidth] = useState<number | null>(null);
  const zoomed = zoomWidth !== null;

  const zoomIn = (point?: { clientX: number; clientY: number }) => {
    const region = regionRef.current;
    const image = imageRef.current?.querySelector('img');
    if (!region || !image || zoomed) return;
    const box = contentBox(image);
    const regionRect = region.getBoundingClientRect();
    const clientX = point?.clientX ?? box.left + box.width / 2;
    const clientY = point?.clientY ?? box.top + box.height / 2;
    focalPoint.current = {
      x: clamp01((clientX - box.left) / box.width),
      y: clamp01((clientY - box.top) / box.height),
      offsetX: point ? clientX - regionRect.left : region.clientWidth / 2,
      offsetY: point ? clientY - regionRect.top : region.clientHeight / 2,
    };
    // The render's own pixels, but always at least twice the fitted size so
    // the step is visible on high-density screens, and never past native.
    const nativeWidth = ART_WIDTH / (window.devicePixelRatio || 1);
    setZoomWidth(Math.round(Math.min(ART_WIDTH, Math.max(nativeWidth, box.width * 2))));
  };

  const fit = () => setZoomWidth(null);

  // Keep the selected point under the pointer (or centred) once the zoomed
  // image has its size, then hand focus to the pannable region.
  useLayoutEffect(() => {
    const region = regionRef.current;
    const point = focalPoint.current;
    if (!region || !zoomed || !point) return;
    focalPoint.current = null;
    region.scrollLeft = point.x * region.scrollWidth - point.offsetX;
    region.scrollTop = point.y * region.scrollHeight - point.offsetY;
    region.focus({ preventScroll: true });
  }, [zoomed]);

  const handleOpenChange = (next: boolean) => {
    if (!next) fit();
    onOpenChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomIn();
    } else if (event.key === '-' || event.key === '0') {
      event.preventDefault();
      fit();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const region = regionRef.current;
    // Touch pans natively through overflow scrolling; the mouse drags.
    if (!zoomed || !region || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: region.scrollLeft,
      top: region.scrollTop,
      moved: false,
    };
    region.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const region = regionRef.current;
    const state = drag.current;
    if (!region || !state || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD_PX) return;
    state.moved = true;
    region.scrollLeft = state.left - dx;
    region.scrollTop = state.top - dy;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    regionRef.current?.releasePointerCapture?.(event.pointerId);
    // Keep the flag until the click that follows, so a drag never toggles zoom.
    if (!state.moved) drag.current = null;
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (drag.current?.moved) {
      drag.current = null;
      return;
    }
    drag.current = null;
    if (zoomed) fit();
    else zoomIn({ clientX: event.clientX, clientY: event.clientY });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-art-ground',
            'motion-safe:duration-[var(--duration-slow)] motion-safe:ease-[var(--ease-gallery)]',
            'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0',
            'motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0',
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={hintId}
          onKeyDown={handleKeyDown}
          onCloseAutoFocus={(event) => {
            const target = returnFocusRef?.current;
            if (!target) return;
            event.preventDefault();
            target.focus();
          }}
          className={cn(
            'fixed inset-0 z-50 flex flex-col bg-art-ground text-foreground focus-ring-none',
            'motion-safe:duration-[var(--duration-slow)] motion-safe:ease-[var(--ease-gallery)]',
            'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0',
            'motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0',
          )}
          data-testid="art-lightbox"
        >
          <div className="flex shrink-0 items-center gap-2 px-[var(--gutter)] pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
            <DialogPrimitive.Title className="min-w-0 flex-1 truncate type-label text-muted-foreground">
              {title}
            </DialogPrimitive.Title>
            {chain.source ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => (zoomed ? fit() : zoomIn())}
                className="normal-case max-sm:min-w-11"
              >
                {zoomed ? <ZoomOut aria-hidden /> : <ZoomIn aria-hidden />}
                <span className="max-sm:sr-only">
                  {zoomed ? t('viewer.zoomOut') : t('viewer.zoomIn')}
                </span>
              </Button>
            ) : null}
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={tCommon('actions.close')}
              >
                <X aria-hidden />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <p id={hintId} className="sr-only">
            {zoomed ? t('viewer.panHint') : t('viewer.zoomHint')}
          </p>

          {chain.source ? (
            // The pannable region: focusable so the arrow keys scroll it, and
            // clickable as the pointer shortcut for the zoom button above.
            <div
              ref={regionRef}
              role="region"
              aria-label={title}
              tabIndex={0}
              onClick={handleClick}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                // A press here starts a pan: no iOS callout sheet over the drag.
                'relative flex min-h-0 flex-1 focus-ring-inset [-webkit-touch-callout:none]',
                zoomed
                  ? 'cursor-grab overflow-auto overscroll-contain active:cursor-grabbing'
                  : 'cursor-zoom-in overflow-hidden',
              )}
              data-zoomed={zoomed || undefined}
            >
              <div
                ref={imageRef}
                className={cn(zoomed ? 'm-auto shrink-0' : 'h-full w-full')}
                style={zoomed ? { width: zoomWidth } : undefined}
              >
                <ArtImage
                  source={chain.source}
                  alt={alt}
                  sizes={zoomed ? `${zoomWidth}px` : '100vw'}
                  priority
                  onError={chain.onError}
                  onLoad={chain.onLoad}
                  className={cn(
                    'select-none',
                    zoomed ? 'h-auto w-full max-w-none' : 'h-full w-full object-contain',
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center p-[var(--gutter)]">
              <PendingPlate label={unavailableLabel} alt={alt} className="max-h-full w-auto" />
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
