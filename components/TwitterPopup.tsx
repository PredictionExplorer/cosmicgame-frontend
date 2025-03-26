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

interface TwitterPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setTwitterHandle: (handle: string) => void;
}

/**
 * TwitterPopup Component
 * A modal dialog that collects and validates the user's Twitter handle.
 */
const TwitterPopup: React.FC<TwitterPopupProps> = ({
  open,
  setOpen,
  setTwitterHandle,
}) => {
  const [handle, setHandle] = useState<string>("");

  // Close the dialog without saving
  const handleClose = () => {
    setOpen(false);
  };

  // Validate and confirm the Twitter handle input
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
