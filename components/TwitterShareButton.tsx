import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

export default function TwitterShareButton() {
  const [handle, setHandle] = useState("");
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleConfirm = () => {
    let tweetText;
    if (handle.startsWith("@")) {
      tweetText = `I'm joining the @CosmicSignature test round on @arbitrum Sepolia for free! Over $60,000 in prizes up for grabs! https://x.com/CosmicSignature/status/1821607885819785412
Use my referral link and you'll get an extra $100 if you win: https://cosmicsignature.com/?referred_by=${handle.slice(
        1
      )}`;
    } else {
      tweetText = `I'm joining the @CosmicSignature test round on @arbitrum Sepolia for free! Over $60,000 in prizes up for grabs! https://x.com/CosmicSignature/status/1821607885819785412
Use my referral link and you'll get an extra $100 if you win: https://cosmicsignature.com/?referred_by=${handle}`;
    }
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;
    window.open(twitterUrl, "_blank");
    handleClose();
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClick}>
        Share on Twitter
      </Button>
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
          <Button onClick={handleConfirm} disabled={handle === ""}>
            Ok
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
