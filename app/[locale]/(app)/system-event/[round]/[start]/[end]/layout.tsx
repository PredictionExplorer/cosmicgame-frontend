import type { ReactNode } from 'react';

import { redirect } from '@/i18n/navigation';

import { checkSystemEventWindow } from './systemEventLink';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string; round: string; start: string; end: string }>;
}

/**
 * Sends a configuration window's link with other event log ids to the
 * cycle's canonical window before the page renders (`checkSystemEventWindow`).
 * A cycle with no window is the page's own business: it renders the
 * window's not-found state on the server.
 */
export default async function SystemEventWindowGuard({ children, params }: LayoutProps) {
  const { locale, round, start, end } = await params;
  const check = await checkSystemEventWindow(Number(round), Number(start), Number(end));
  if (check.status === 'moved') {
    const { window } = check;
    redirect({ href: `/system-event/${window.round}/${window.start}/${window.end}`, locale });
  }
  return children;
}
