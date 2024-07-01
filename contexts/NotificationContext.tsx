import { createContext, useContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "warning" | "error";
    visible: boolean;
  }>({
    text: "",
    type: "error",
    visible: false,
  });
  const handleNotificationClose = () => {
    setNotification({ ...notification, visible: false });
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

export const useNotification = () => useContext(NotificationContext);
