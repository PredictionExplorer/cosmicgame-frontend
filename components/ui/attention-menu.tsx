'use client';

import { useId, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  ALERT_MINUTE_CHOICES,
  getNotificationPermission,
  useAttentionPreferences,
  type AlertMinutes,
  type NotificationPermissionState,
} from '@/hooks/useAttentionPreferences';
import { previewGestureChime } from '@/hooks/useGestureChime';
import { cn } from '@/lib/utils';

interface PreferenceRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

function PreferenceRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  children,
}: PreferenceRowProps) {
  return (
    <div className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={id} className="block cursor-pointer text-sm font-medium text-foreground">
            {label}
          </label>
          <p
            id={`${id}-description`}
            className="mt-1 text-xs leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-describedby={`${id}-description`}
          className="mt-0.5"
        />
      </div>
      {children}
    </div>
  );
}

export interface AttentionMenuProps {
  className?: string;
}

/**
 * The bell that holds every attention setting: the Gesture chime, the alert
 * before finalization and the tab-title countdown. Everything starts off and
 * is saved per browser (useAttentionPreferences). Turning sound on plays the
 * chime once, which both previews it and unlocks audio for the page; turning
 * the alert on asks for notification permission at that moment, never
 * mid-gesture.
 */
export function AttentionMenu({ className }: AttentionMenuProps) {
  const t = useTranslations('common');
  const { preferences, setSound, setTabTitle, setFinalizationAlert } = useAttentionPreferences();
  const [permission, setPermission] = useState<NotificationPermissionState | null>(null);
  const baseId = useId();
  const anyOn = preferences.sound || preferences.finalizationAlert || preferences.tabTitle;
  const currentPermission = permission ?? getNotificationPermission();
  const alertUnavailable = currentPermission === 'denied' || currentPermission === 'unsupported';

  const onSoundChange = (checked: boolean) => {
    setSound(checked);
    if (checked) void previewGestureChime();
  };

  const onAlertChange = (checked: boolean) => {
    void setFinalizationAlert(checked ? preferences.alertMinutes : null).then(setPermission);
  };

  const onMinutesChange = (minutes: AlertMinutes) => {
    void setFinalizationAlert(minutes).then(setPermission);
  };

  const BellIcon = anyOn ? BellRing : Bell;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('attention.menuLabel')}
          data-testid="attention-menu-trigger"
          className={cn(
            'relative rounded-full border border-border text-muted-foreground hover:text-foreground',
            anyOn && 'text-foreground',
            className,
          )}
        >
          <BellIcon aria-hidden />
          {anyOn && (
            <span
              aria-hidden
              className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary sm:right-1.5 sm:top-1.5"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={16}
        aria-labelledby={`${baseId}-title`}
        className="w-[min(22rem,calc(100vw-2rem))] border-border p-4"
        data-testid="attention-menu"
      >
        <h2 id={`${baseId}-title`} className="text-sm font-semibold text-foreground">
          {t('attention.title')}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('attention.intro')}</p>
        <div className="mt-4 divide-y divide-border">
          <PreferenceRow
            id={`${baseId}-sound`}
            label={t('attention.sound.label')}
            description={t('attention.sound.description')}
            checked={preferences.sound}
            onCheckedChange={onSoundChange}
          />
          <PreferenceRow
            id={`${baseId}-alert`}
            label={t('attention.alert.label')}
            description={
              currentPermission === 'unsupported'
                ? t('attention.alert.unsupported')
                : currentPermission === 'denied'
                  ? t('attention.alert.blocked')
                  : t('attention.alert.description')
            }
            checked={preferences.finalizationAlert && !alertUnavailable}
            onCheckedChange={onAlertChange}
          >
            {preferences.finalizationAlert && !alertUnavailable && (
              <div
                role="group"
                aria-label={t('attention.alert.label')}
                className="flex flex-wrap gap-1.5"
              >
                {ALERT_MINUTE_CHOICES.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    aria-pressed={preferences.alertMinutes === minutes}
                    onClick={() => onMinutesChange(minutes)}
                    className={cn(
                      'min-h-9 rounded-full border px-3 text-xs font-semibold tabular-nums transition-colors',
                      preferences.alertMinutes === minutes
                        ? 'border-primary/60 bg-primary/15 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t('attention.alert.minutes', { minutes })}
                  </button>
                ))}
              </div>
            )}
          </PreferenceRow>
          <PreferenceRow
            id={`${baseId}-tab`}
            label={t('attention.tabTitle.label')}
            description={t('attention.tabTitle.description')}
            checked={preferences.tabTitle}
            onCheckedChange={setTabTitle}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
