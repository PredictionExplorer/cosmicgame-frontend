import { LEARN_LINK_TARGETS, splitLearnLinks } from '@/content/learn';

import { SiteLink } from '@/components/layout/SiteLink';

import { landingLink } from './guides';

export interface GuideTextProps {
  /** A guide paragraph, which may carry `[label](key)` link tokens. */
  text: string;
  locale: string;
}

/**
 * A guide paragraph with its inline links: each `[label](key)` token becomes
 * a prose link to the page LEARN_LINK_TARGETS names, keeping the reader's
 * locale on the app host.
 */
export function GuideText({ text, locale }: GuideTextProps) {
  return splitLearnLinks(text).map((part, index) => {
    if (typeof part === 'string') return part;
    const target = landingLink(LEARN_LINK_TARGETS[part.target], locale);
    return (
      <SiteLink
        key={`${index}-${part.target}`}
        href={target.href}
        kind={target.kind}
        className="link"
      >
        {part.label}
      </SiteLink>
    );
  });
}
