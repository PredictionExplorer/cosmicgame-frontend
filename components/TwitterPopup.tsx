import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

// Props interface for TwitterPopup component
interface TwitterPopupProps {
  open: boolean; // Controls whether the dialog is open
  setOpen: (open: boolean) => void; // Function to update the open state
  setTwitterHandle: (handle: string) => void; // Callback to set the confirmed handle
}

/**
 * TwitterPopup Component
 * A modal dialog to collect and validate the user's Twitter handle.
 */
const TwitterPopup: React.FC<TwitterPopupProps> = ({
  open,
  setOpen,
  setTwitterHandle,
}) => {
  // Local state for the user-inputted handle
  const [handle, setHandle] = useState<string>("");

  // Closes the dialog without saving the input
  const handleClose = () => {
    setOpen(false);
  };

  // Validates and confirms the handle, stripping any leading "@"
  const handleConfirm = () => {
    const formattedHandle = handle.startsWith("@") ? handle.slice(1) : handle;
    setTwitterHandle(formattedHandle);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>What is your Twitter handle?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide your Twitter handle. Ensure it has a blue checkmark to
          qualify.
        </DialogContentText>
        <DialogContentText>
          Follow additional instructions on our Twitter page to be fully
          eligible.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="twitter_handle"
          name="twitter_handle"
          label="Twitter Handle"
          placeholder="@userhandle"
          fullWidth
          variant="standard"
          value={handle}
          onChange={(e) => setHandle(e.target.value.trim())}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleConfirm}
          disabled={!handle.trim()}
          variant="contained"
        >
          Ok
        </Button>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TwitterPopup;
