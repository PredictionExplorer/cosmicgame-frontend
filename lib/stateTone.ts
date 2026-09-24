/**
 * Class names for the semantic state colours of the wallet, transaction and
 * live-status UI, kept in one place so the whole set moves to the palette's
 * token utilities in a single edit.
 *
 * Each value reads a palette-tuned state token — `--positive`, `--attention`,
 * `--critical`, `--live` — with the shared default as its fallback, because
 * not every palette on this branch defines them yet. When the tokens package
 * (which adds the tokens to every palette and the matching `--color-*` theme
 * entries) is on the same branch, replace each value with the utility in its
 * comment and drop the fallbacks.
 *
 * Colour never carries a state alone: pair it with an icon or a word.
 */
export const stateTone = {
  /** → `text-positive` */
  positiveText: 'text-[hsl(var(--positive,var(--success)))]',
  /** → `bg-positive` */
  positiveDot: 'bg-[hsl(var(--positive,var(--success)))]',
  /** → `text-attention` */
  attentionText: 'text-[hsl(var(--attention,40_90%_68%))]',
  /** → `bg-attention` */
  attentionDot: 'bg-[hsl(var(--attention,40_90%_68%))]',
  /** → `border-attention/45 bg-attention-surface hover:bg-attention/20` */
  attentionChip:
    'border-[hsl(var(--attention,40_90%_68%)/0.45)] bg-[hsl(var(--attention,40_90%_68%)/0.12)] hover:bg-[hsl(var(--attention,40_90%_68%)/0.2)]',
  /** → `text-critical` */
  criticalText: 'text-[hsl(var(--critical,0_80%_72%))]',
  /** → `bg-critical` */
  criticalDot: 'bg-[hsl(var(--critical,0_80%_72%))]',
  /** → `bg-live` */
  liveDot: 'bg-[hsl(var(--live,var(--positive,var(--success))))]',
} as const;
