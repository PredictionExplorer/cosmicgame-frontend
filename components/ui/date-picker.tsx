'use client';

import { useEffect, useMemo, useState, type FC } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatYyyymmddLabel, toIntlLocale, toYyyymmdd } from '@/utils/format';

function buildMonthGrid(month: Dayjs, weekStartsMonday: boolean): Dayjs[] {
  const monthStart = month.startOf('month');
  const monthEnd = month.endOf('month');
  const startOffset = weekStartsMonday ? (monthStart.day() + 6) % 7 : monthStart.day();
  const endWeekday = weekStartsMonday ? (monthEnd.day() + 6) % 7 : monthEnd.day();
  const start = monthStart.subtract(startOffset, 'day');
  const end = monthEnd.add(6 - endWeekday, 'day');
  const days: Dayjs[] = [];
  let cursor = start;
  while (cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }
  return days;
}

type CalendarPanelProps = {
  viewMonth: Dayjs;
  onViewMonthChange: (month: Dayjs) => void;
  selected: Dayjs | null;
  onSelect: (day: Dayjs) => void;
};

function CalendarPanel({ viewMonth, onViewMonthChange, selected, onSelect }: CalendarPanelProps) {
  const t = useTranslations('forms');
  const locale = useLocale();
  const { weekStartsMonday } = getLocaleConfig(locale);
  const days = useMemo(
    () => buildMonthGrid(viewMonth, weekStartsMonday),
    [viewMonth, weekStartsMonday],
  );
  const weekdayKeys = weekStartsMonday
    ? (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const)
    : (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const);
  const monthLabel = new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: 'long',
    year: 'numeric',
  }).format(viewMonth.toDate());

  return (
    <div className="p-3" data-testid="date-picker-calendar">
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t('datePicker.previousMonth')}
          onClick={() => onViewMonthChange(viewMonth.subtract(1, 'month'))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={t('datePicker.nextMonth')}
          onClick={() => onViewMonthChange(viewMonth.add(1, 'month'))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdayKeys.map((day) => (
          <div
            key={day}
            className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
          >
            {t(`datePicker.weekdays.${day}`)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = day.month() === viewMonth.month();
          const isSelected = selected?.isSame(day, 'day') ?? false;
          const isToday = day.isSame(dayjs(), 'day');

          return (
            <button
              key={day.format('YYYY-MM-DD')}
              type="button"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
                'hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                !isCurrentMonth && 'text-muted-foreground/50',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                !isSelected && isToday && 'border border-primary/50',
              )}
              onClick={() => onSelect(day)}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type DatePickerProps = {
  id: string;
  label: string;
  /** HTML date value: YYYY-MM-DD */
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
};

/** Date field with popover calendar for picking a day. */
export const DatePicker: FC<DatePickerProps> = ({ id, label, value, onChange, className }) => {
  const t = useTranslations('forms');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => (value ? dayjs(value) : null), [value]);
  const [viewMonth, setViewMonth] = useState(() =>
    (value ? dayjs(value) : dayjs()).startOf('month'),
  );

  useEffect(() => {
    if (open && value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync visible month when opening an existing value.
      setViewMonth(dayjs(value).startOf('month'));
    }
  }, [open, value]);

  const displayLabel = value
    ? formatYyyymmddLabel(toYyyymmdd(value), locale)
    : t('datePicker.pickDate');

  const handleSelect = (day: Dayjs) => {
    onChange(day.format('YYYY-MM-DD'));
    setOpen(false);
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-[11rem] justify-start font-normal"
            aria-label={label}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            <span className="truncate">{displayLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarPanel
            viewMonth={viewMonth}
            onViewMonthChange={setViewMonth}
            selected={selected}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
