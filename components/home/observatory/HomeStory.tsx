import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { CstTokenIcon, GestureIcon, PublicGoodsIcon } from '@/lib/conceptIcons';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

import { DESK_FRAME } from './ControlDesk';

const STORIES = [
  { key: 'gestures', icon: GestureIcon },
  { key: 'cst', icon: CstTokenIcon },
  { key: 'publicGoods', icon: PublicGoodsIcon },
] as const;

const LINK_CLASS = cn(
  'link-quiet inline-flex items-center gap-1 type-label text-primary',
  TOUCH_TARGET_TEXT_LINK_CLASS,
);

export interface HomeStoryProps {
  className?: string;
}

/**
 * The art behind the cycle: what a Gesture leaves behind, what CST records
 * and where the reserve goes, as three short notes behind a native
 * disclosure at the end of the page. The artwork itself hangs on the desk.
 */
export function HomeStory({ className }: HomeStoryProps) {
  const t = useTranslations('home');
  return (
    <details data-testid="home-story-section" className={cn('group/story', DESK_FRAME, className)}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 type-title text-foreground sm:px-6 [&::-webkit-details-marker]:hidden">
        {t('orientation.storyTitle')}
        <ChevronDown
          className="size-5 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] group-open/story:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </summary>
      <div className="border-t border-rule-faint px-5 py-5 sm:px-6">
        {/* The summary is a control, not a heading: the notes' section heading
            is stated here for heading navigation. */}
        <h2 className="sr-only">{t('orientation.storyTitle')}</h2>
        <p className="type-body-md max-w-[var(--measure-lede)] text-muted-foreground">
          {t('hero.phase.live.body')}
        </p>
        <ul
          role="list"
          className="mt-5 grid gap-5 md:grid-cols-3 md:gap-0 md:divide-x md:divide-rule-faint"
        >
          {STORIES.map(({ key, icon: Icon }) => (
            <li key={key} className="min-w-0 md:px-5 md:first:ps-0 md:last:pe-0">
              <Icon className="size-4 text-subtle" aria-hidden />
              <h3 className="type-title mt-2 text-foreground">{t(`hero.story.${key}.title`)}</h3>
              <p className="type-body-sm mt-1 text-muted-foreground">
                {t(`hero.story.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 border-t border-rule-faint pt-3">
          <Link href="/gallery" className={LINK_CLASS}>
            {t('latestSignature.gallery')}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link href="/coordination-changes" className={LINK_CLASS}>
            {t('hero.console.parameters')}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </details>
  );
}
