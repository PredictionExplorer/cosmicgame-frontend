import { Dialog, DialogContent } from '@/components/ui/dialog';

interface VideoPlayerDialogProps {
  open: boolean;
  videoPath: string | null;
  onClose: () => void;
}

const VideoPlayerDialog = ({ open, videoPath, onClose }: VideoPlayerDialogProps) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <DialogContent className="max-w-4xl border-none bg-black p-0 shadow-none [&>button]:text-white">
      {videoPath && (
        <video src={videoPath} controls autoPlay className="block max-h-[80vh] w-full" />
      )}
    </DialogContent>
  </Dialog>
);

export default VideoPlayerDialog;
