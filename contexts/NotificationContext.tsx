import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

/**
 * Describes the shape of our notification state.
 */
interface NotificationState {
  text: string;
  type: "success" | "info" | "warning" | "error";
  visible: boolean;
}

/**
 * Describes the shape of the context's value.
 * We only expose the `setNotification` function here,
 * which controls the notification's state.
 */
interface NotificationContextValue {
  setNotification: React.Dispatch<React.SetStateAction<NotificationState>>;
}

/**
 * Create the notification context with a default value of `undefined`.
 * We do this so TypeScript can catch cases where the context is used without
 * a proper provider.
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

/**
 * Typing for the `NotificationProvider` props.
 * It expects children as ReactNode.
 */
interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * The `NotificationProvider` component that manages
 * and provides notification state to its child components.
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  // Local state to store and control notification info
  const [notification, setNotification] = useState<NotificationState>({
    text: "",
    type: "error",
    visible: false,
  });

  /**
   * Closes the notification by setting `visible` to false.
   */
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, visible: false }));
  };

  return (
    <NotificationContext.Provider value={{ setNotification }}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={5000}
        open={notification.visible}
        onClose={handleNotificationClose}
      >
        <Alert
          severity={notification.type}
          variant="filled"
          onClose={handleNotificationClose}
        >
          {notification.text}
        </Alert>
      </Snackbar>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * A custom hook to access our notification context.
 * Will throw an error if used outside of a `NotificationProvider`.
 */
export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
