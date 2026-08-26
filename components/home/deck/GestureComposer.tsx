'use client';

import type { RefObject } from 'react';
import { ArrowRight, PenLine } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/lib/utils';

const MESSAGE_MAX_LENGTH = protocolFacts.gestureMessageMaxLength;
const MESSAGE_COUNTER_WARN_AT = MESSAGE_MAX_LENGTH - 20;

interface GestureComposerProps {
  message: string;
  setMessage: (value: string) => void;
  gestureType: string;
  onSelectGestureType: (value: string) => void;
  showCstOption: boolean;
  rwlkId: number;
  account?: string | null;
  isGesturing: boolean;
  canGesture: boolean;
  submitLabel: string;
  onGesture: () => void;
  onOpenFullConsole: () => void;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
}

/**
 * The chat's write side, docked directly above the message feed. Posting a
 * message IS making a gesture — the message rides the same on-chain
 * transaction — so the send button is the gesture button, labeled with the
 * live cost from the shared submit-label helper.
 */
export function GestureComposer({
  message,
  setMessage,
  gestureType,
  onSelectGestureType,
  showCstOption,
  rwlkId,
  account = null,
  isGesturing,
  canGesture,
  submitLabel,
  onGesture,
  onOpenFullConsole,
  textareaRef,
  className,
}: GestureComposerProps) {
  const t = useTranslations('home');

  const needsRwlkToken = gestureType === 'RandomWalk' && rwlkId === -1;
  const sendDisabled = isGesturing || !canGesture || needsRwlkToken || gestureType === '';
  const methodValue = gestureType === 'RandomWalk' ? 'ETH' : gestureType;

  return (
    <Surface
      asChild
      variant="glass-bordered"
      radius="xl"
      padding="none"
      className={cn('min-w-0', className)}
    >
      <section aria-labelledby="gesture-composer-title" data-testid="gesture-composer">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
              <PenLine className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2
                id="gesture-composer-title"
                className="font-display text-sm font-bold tracking-tight"
              >
                {t('deck.composer.title')}
              </h2>
              <p className="text-[11px] text-muted-foreground">{t('deck.composer.subtitle')}</p>
            </div>
          </div>

          {account ? (
            <>
              <div className="mt-3">
                <textarea
                  ref={textareaRef}
                  data-testid="composer-message-input"
                  placeholder={t('deck.composer.placeholder')}
                  value={message}
                  maxLength={MESSAGE_MAX_LENGTH}
                  rows={2}
                  aria-label={t('form.advanced.messageLabel')}
                  className="flex min-h-[56px] w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div
                    role="group"
                    aria-label={t('form.methodLabel')}
                    className="flex items-center gap-1"
                  >
                    {['ETH', ...(showCstOption ? ['CST'] : [])].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onSelectGestureType(option)}
                        aria-pressed={methodValue === option}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                          methodValue === option
                            ? 'border-primary/50 bg-primary/12 text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-white',
                        )}
                      >
                        {option === 'ETH' ? t('form.method.eth.label') : t('form.method.cst.label')}
                      </button>
                    ))}
                    {gestureType === 'RandomWalk' && (
                      <button
                        type="button"
                        onClick={onOpenFullConsole}
                        className="rounded-full border border-[rgb(var(--nebula-violet-rgb)/0.4)] bg-[rgb(var(--nebula-violet-rgb)/0.12)] px-2.5 py-1 text-[11px] font-semibold text-[rgb(var(--nebula-violet-rgb))]"
                      >
                        {rwlkId !== -1
                          ? t('deck.composer.rwlkChip', { id: String(rwlkId) })
                          : t('deck.composer.rwlkChoose')}
                      </button>
                    )}
                  </div>
                  <span
                    data-testid="composer-char-count"
                    className={cn(
                      'text-[11px] tabular-nums',
                      message.length >= MESSAGE_COUNTER_WARN_AT
                        ? 'text-amber-300'
                        : 'text-muted-foreground/60',
                    )}
                  >
                    {message.length}/{MESSAGE_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <Button
                id="composer-gesture-submit"
                size="lg"
                onClick={onGesture}
                disabled={sendDisabled}
                className="mt-2.5 h-11 w-full border-0 bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] text-sm font-semibold text-white hover:opacity-90"
              >
                {isGesturing ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> {t('form.processing')}
                  </span>
                ) : (
                  <>
                    {submitLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
              {!canGesture && (
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {t('form.finalGestureMade')}
                </p>
              )}
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
                {t('deck.composer.note')}
              </p>
            </>
          ) : (
            <div data-testid="composer-connect" className="mt-3 space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('deck.composer.connectBody')}
              </p>
              <ConnectWalletButton
                isMobileView={false}
                loading={false}
                balance={{ ETH: 0, CosmicToken: 0, CosmicSignature: 0, RWLK: 0 }}
                stakedTokenCount={{ cst: 0, rwalk: 0 }}
              />
            </div>
          )}
        </div>
      </section>
    </Surface>
  );
}
