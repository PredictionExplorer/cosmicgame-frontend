'use client';

import { useEffect, useMemo, useState, type FC } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatYyyymmddLabel, toYyyymmdd } from '@/utils/format';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildMonthGrid(month: Dayjs): Dayjs[] {
  const start = month.startOf('month').startOf('week');
  const end = month.endOf('month').endOf('week');
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

function CalendarPanel({
  viewMonth,
  onViewMonthChange,
  selected,
  onSelect,
}: CalendarPanelProps) {
  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  return (
    <div className="p-3" data-testid="date-picker-calendar">
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Previous month"
          onClick={() => onViewMonthChange(viewMonth.subtract(1, 'month'))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{viewMonth.format('MMMM YYYY')}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Next month"
          onClick={() => onViewMonthChange(viewMonth.add(1, 'month'))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
          >
            {day}
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
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => (value ? dayjs(value) : null), [value]);
  const [viewMonth, setViewMonth] = useState(() =>
    (value ? dayjs(value) : dayjs()).startOf('month'),
  );

  useEffect(() => {
    if (open && value) {
      setViewMonth(dayjs(value).startOf('month'));
    }
  }, [open, value]);

  const displayLabel = value ? formatYyyymmddLabel(toYyyymmdd(value)) : 'Pick a date';

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
