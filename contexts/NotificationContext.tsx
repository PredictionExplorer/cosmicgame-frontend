import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { toast, type ExternalToast } from 'sonner';

export interface NotificationState {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
  visible: boolean;
  /**
   * Technical details behind the message (a classified wallet or RPC
   * error). When present the toast gets a "Copy details" action for support
   * and stays until dismissed; the details themselves are never shown.
   */
  details?: string;
  /** Replaces the toast with the same id instead of stacking another. */
  id?: string;
}

type SetNotification = (
  value: NotificationState | ((prev: NotificationState) => NotificationState),
) => void;

interface NotificationContextValue {
  setNotification: SetNotification;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

let detailToastSequence = 0;

/**
 * Builds the toast dispatcher. The translator is read through a ref so the
 * dispatcher stays referentially stable across renders and locale changes.
 */
function useToastDispatcher(): SetNotification {
  const t = useTranslations('toasts');
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  return useCallback((value) => {
    const notification =
      typeof value === 'function' ? value({ text: '', type: 'error', visible: false }) : value;

    if (!notification.visible) return;

    const { text: message, details } = notification;
    const id = notification.id ?? (details ? `notice-${++detailToastSequence}` : undefined);
    const options: ExternalToast | undefined =
      details || id
        ? {
            ...(id ? { id } : {}),
            ...(details
              ? {
                  duration: Number.POSITIVE_INFINITY,
                  action: {
                    label: tRef.current('tx.copyDetails'),
                    onClick: (event: { preventDefault: () => void }) => {
                      // Keep the message on screen after copying.
                      event.preventDefault();
                      void navigator.clipboard
                        ?.writeText(details)
                        .then(() =>
                          toast.success(tRef.current('tx.detailsCopied'), { id: `${id}:copied` }),
                        )
                        .catch(() => undefined);
                    },
                  },
                }
              : {}),
          }
        : undefined;

    const show = (fn: (text: string, data?: ExternalToast) => string | number) =>
      options ? fn(message, options) : fn(message);
    switch (notification.type) {
      case 'success':
        show(toast.success);
        break;
      case 'info':
        show(toast.info);
        break;
      case 'warning':
        show(toast.warning);
        break;
      case 'error':
        show(toast.error);
        break;
      default:
        show(toast);
    }
  }, []);
}

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const setNotification = useToastDispatcher();
  const value = useMemo(() => ({ setNotification }), [setNotification]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

/**
 * The app's toast dispatcher. Inside `NotificationProvider` it is shared;
 * outside one (an isolated widget, a unit test) it falls back to an
 * equivalent local dispatcher, since toasts render through the global
 * Toaster either way.
 */
export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  const fallbackDispatcher = useToastDispatcher();
  const fallback = useMemo(() => ({ setNotification: fallbackDispatcher }), [fallbackDispatcher]);
  return context ?? fallback;
};
