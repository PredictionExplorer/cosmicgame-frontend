import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { redirect } from '@/i18n/navigation';

import { readSystemModes } from '../../../../publicDataReads';
import { seedsDisabled } from '../../../../QuerySeed';

import { canonicalWindow } from './systemEventWindow';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; round: string; start: string; end: string }>;
}

/**
 * Keeps a configuration window honest before the page's loading boundary
 * starts streaming: the page states what the contract owner changed before
 * a cycle, so its event range must be that cycle's, from the mode change
 * list. A link with other ids is sent to the canonical window, and a cycle
 * the list has no window for is a 404. When the list cannot be read (or
 * under the e2e harness, whose specs mock it in the browser) the link is
 * taken as it is, and the page's own range check applies.
 */
export default async function SystemEventWindowGuard({ children, params }: LayoutProps) {
  const { locale, round, start, end } = await params;
  if (seedsDisabled()) return children;
  const modes = await readSystemModes();
  if (modes.data === null) return children;
  const cycle = Number(round);
  const canonical = Number.isSafeInteger(cycle) ? canonicalWindow(modes.data, cycle) : null;
  if (!canonical) {
    // The list (as the app reads it) has no entry for the first setup, which
    // always starts at the first event; only its end cannot be checked here.
    if (cycle === 0 && Number(start) === -1) return children;
    notFound();
  }
  if (canonical.start !== Number(start) || canonical.end !== Number(end)) {
    redirect({
      href: `/system-event/${canonical.round}/${canonical.start}/${canonical.end}`,
      locale,
    });
  }
  return children;
}
