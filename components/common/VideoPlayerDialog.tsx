import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface VideoPlayerDialogProps {
  open: boolean;
  videoPath: string | null;
  onClose: () => void;
}

/** Modal dialog that plays a video file with autoplay, responsive sizing, and a close button. */
const VideoPlayerDialog = ({ open, videoPath, onClose }: VideoPlayerDialogProps) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent
      className="max-w-4xl border-none bg-black p-0 shadow-none [&>button]:text-white"
      aria-describedby={undefined}
    >
      <VisuallyHidden.Root asChild>
        <DialogTitle>Video</DialogTitle>
      </VisuallyHidden.Root>
      {videoPath && (
        <video
          src={videoPath}
          controls
          autoPlay
          playsInline
          className="block max-h-[80vh] w-full"
        />
      )}
    </DialogContent>
  </Dialog>
);

export default VideoPlayerDialog;
