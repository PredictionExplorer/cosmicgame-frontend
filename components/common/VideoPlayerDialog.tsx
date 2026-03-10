import { Dialog, DialogContent, Button } from '@mui/material';

interface VideoPlayerDialogProps {
  open: boolean;
  videoPath: string | null;
  onClose: () => void;
}

/**
 * Full-width dialog for playing NFT videos using native <video>
 * to avoid iframe/proxy issues in Chrome.
 */
const VideoPlayerDialog = ({ open, videoPath, onClose }: VideoPlayerDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="lg"
    fullWidth
    PaperProps={{ sx: { bgcolor: 'black', boxShadow: 'none' } }}
  >
    <DialogContent sx={{ p: 0, position: 'relative', lineHeight: 0 }}>
      <Button
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'white',
          zIndex: 1,
          minWidth: 'auto',
          fontSize: '1.5rem',
        }}
      >
        ✕
      </Button>
      {videoPath && (
        <video
          src={videoPath}
          controls
          autoPlay
          style={{ width: '100%', maxHeight: '80vh', display: 'block' }}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default VideoPlayerDialog;
