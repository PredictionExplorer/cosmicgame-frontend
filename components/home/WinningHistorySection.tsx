import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import { getAssetsUrl } from '@/utils';

import WinningHistoryTable from '@/components/tables/WinningHistoryTable';
import type { WinningHistoryEntry } from '@/components/tables/WinningHistoryTable';
import TwitterShareButton from '@/components/common/TwitterShareButton';
import TwitterPopup from '@/components/common/TwitterPopup';

interface WinningHistorySectionProps {
  claimHistory: WinningHistoryEntry[] | null;
  imageOpen: boolean;
  setImageOpen: (open: boolean) => void;
  bannerTokenSeed: string;
  twitterPopupOpen: boolean;
  setTwitterPopupOpen: (open: boolean) => void;
  setTwitterHandle: (handle: string) => void;
}

export function WinningHistorySection({
  claimHistory,
  imageOpen,
  setImageOpen,
  bannerTokenSeed,
  twitterPopupOpen,
  setTwitterPopupOpen,
  setTwitterHandle,
}: WinningHistorySectionProps) {
  const imageSrc =
    bannerTokenSeed === ''
      ? '/images/qmark.png'
      : getAssetsUrl(`cosmicsignature/${bannerTokenSeed}.png`);

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="my-[100px]">
          <h4 className="text-2xl font-semibold text-center mb-12 text-foreground">
            History of Winnings
          </h4>
          {claimHistory === null ? (
            <p className="text-lg font-medium text-foreground">Loading...</p>
          ) : (
            <WinningHistoryTable winningHistory={claimHistory} />
          )}
        </div>
        <div className="my-[100px]">
          <h4 className="text-2xl font-semibold text-center mb-12 text-foreground">
            Create a Twitter Post and Refer People
          </h4>
          <TwitterShareButton />
        </div>
      </div>
      <Lightbox open={imageOpen} close={() => setImageOpen(false)} slides={[{ src: imageSrc }]} />
      <TwitterPopup
        open={twitterPopupOpen}
        setOpen={setTwitterPopupOpen}
        setTwitterHandle={setTwitterHandle}
      />
    </>
  );
}
