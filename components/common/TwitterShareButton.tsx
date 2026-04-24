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
  DialogTrigger,
} from '@/components/ui/dialog';

const TwitterShareButton = () => {
  const [handle, setHandle] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const handleConfirm = () => {
    const formattedHandle = handle.startsWith('@') ? handle.slice(1) : handle;

    const tweetText = `I'm joining the @CosmicSignature test cycle on @arbitrum Sepolia for free! Over $60,000 in allocations up for grabs! https://x.com/CosmicSignature/status/1821607885819785412\nUse my referral link and you'll receive an extra $100: https://cosmicsignature.com/?referred_by=${formattedHandle}`;

    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Share on Twitter</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What is your Twitter handle?</DialogTitle>
          <DialogDescription>
            Enter your Twitter handle below. Ensure your account has a blue checkmark.
          </DialogDescription>
          <DialogDescription>
            Follow additional instructions on our Twitter page to confirm eligibility.
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
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TwitterShareButton;
