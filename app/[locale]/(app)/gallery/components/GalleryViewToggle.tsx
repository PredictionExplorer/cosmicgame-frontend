'use client';

import { LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ViewMode } from '../galleryQuery';

import { SegmentedChoice } from './SegmentedChoice';

interface GalleryViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  /** Labelled options stretched across the row (the filter sheet). */
  block?: boolean;
  className?: string;
}

/** Grid of plates or the list ledger. */
export function GalleryViewToggle({
  value,
  onChange,
  block = false,
  className,
}: GalleryViewToggleProps) {
  const t = useTranslations('gallery');

  return (
    <SegmentedChoice
      value={value}
      onChange={onChange}
      label={t('view.ariaLabel')}
      iconOnly={!block}
      block={block}
      className={className}
      options={[
        { value: 'grid', label: t('view.grid'), icon: <LayoutGrid aria-hidden /> },
        { value: 'list', label: t('view.list'), icon: <List aria-hidden /> },
      ]}
    />
  );
}
