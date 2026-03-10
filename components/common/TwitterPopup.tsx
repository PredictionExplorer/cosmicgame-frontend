import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TwitterPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setTwitterHandle: (handle: string) => void;
}

const TwitterPopup = ({ open, setOpen, setTwitterHandle }: TwitterPopupProps) => {
  const [handle, setHandle] = useState<string>('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    const formattedHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    setTwitterHandle(formattedHandle);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What is your Twitter handle?</DialogTitle>
          <DialogDescription>
            Please provide your Twitter handle. Ensure it has a blue checkmark to qualify.
          </DialogDescription>
          <DialogDescription>
            Follow additional instructions on our Twitter page to be fully eligible.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          id="twitter_handle"
          name="twitter_handle"
          placeholder="@userhandle"
          value={handle}
          onChange={(e) => setHandle(e.target.value.trim())}
        />
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!handle.trim()}>
            Ok
          </Button>
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TwitterPopup;
