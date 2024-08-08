import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

export default function TwitterPopup({ open, setOpen, setTwitterHandle }) {
  const [handle, setHandle] = useState("");
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = () => {
    if (handle.startsWith("@")) {
      setTwitterHandle(handle.slice(1));
    } else {
      setTwitterHandle(handle);
    }
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>What is your Twitter handle?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          What is your Twitter handle? (It must have a blue checkmark).
        </DialogContentText>
        <DialogContentText>
          You must follow additional instructions to be eligible. Check our
          Twitter.
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
          onChange={(e) => setHandle(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm}>Ok</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
