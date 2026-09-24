'use client';

import type { ReactNode } from 'react';
import { Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AnchoringIcon } from '@/lib/conceptIcons';

import { STATUS_FILTERS, type StatusFilter } from '../galleryQuery';

import { SegmentedChoice, type SegmentedOption } from './SegmentedChoice';

const ICONS: Record<StatusFilter, ReactNode> = {
  all: null,
  anchored: <AnchoringIcon aria-hidden />,
  named: <Tag aria-hidden />,
};

interface GalleryStatusFilterProps {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
  /** Stretch across the row (the filter sheet). */
  block?: boolean;
  className?: string;
}

/** All, Anchored or Named: which Signatures the grid shows. */
export function GalleryStatusFilter({
  value,
  onChange,
  block,
  className,
}: GalleryStatusFilterProps) {
  const t = useTranslations('gallery');
  const options: SegmentedOption<StatusFilter>[] = STATUS_FILTERS.map((status) => ({
    value: status,
    label: t(`filters.${status}.label`),
    hint: t(`filters.${status}.tooltip`),
    icon: ICONS[status],
  }));

  return (
    <SegmentedChoice
      value={value}
      options={options}
      onChange={onChange}
      label={t('filters.ariaLabel')}
      block={block}
      className={className}
    />
  );
}
