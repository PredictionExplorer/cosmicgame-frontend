import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';

interface NotificationState {
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
  visible: boolean;
}

interface NotificationContextValue {
  setNotification: (
    value: NotificationState | ((prev: NotificationState) => NotificationState),
  ) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const setNotification = useCallback(
    (value: NotificationState | ((prev: NotificationState) => NotificationState)) => {
      const notification =
        typeof value === 'function' ? value({ text: '', type: 'error', visible: false }) : value;

      if (!notification.visible) return;

      const message = notification.text;
      switch (notification.type) {
        case 'success':
          toast.success(message);
          break;
        case 'info':
          toast.info(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        case 'error':
          toast.error(message);
          break;
        default:
          toast(message);
      }
    },
    [],
  );

  return (
    <NotificationContext.Provider value={{ setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
