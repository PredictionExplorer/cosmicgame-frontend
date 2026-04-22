'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';

import { getAssetsUrl, getOriginUrl } from '@/utils';

import { DefinitionList, DetailRow, SectionCard } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import NFTImage from '@/components/nft/NFTImage';
import {
  MainWrapper,
  NFTInfoWrapper,
  PrimaryMenuItem,
  SectionWrapper,
  StyledCard,
} from '@/components/styled';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/useClipboard';
import 'yet-another-react-lightbox/styles.css';
import NFTVideo from '@/components/nft/NFTVideo';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';

const SampleDetailPage = () => {
  const { copy } = useClipboard();
  const [isVideoOpen, setVideoOpen] = useState(false);
  const [isImageOpen, setImageOpen] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const image = getAssetsUrl('cosmicsignature/sample.png');
  const video = getAssetsUrl('cosmicsignature/sample.mp4');

  const handlePlayVideo = (path: string) => {
    setVideoPath(path);
    setVideoOpen(true);
  };

  return (
    <MainWrapper className="max-w-none px-0">
      <div className="mx-auto w-full max-w-7xl px-4">
        <PageHeader
          title="Sample NFT detail"
          subtitle="Reference layout for Cosmic Signature tokens"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sample detail' }]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />
        <SectionWrapper>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            <div className="max-w-md mx-auto w-full md:max-w-none">
              <StyledCard>
                <div className="cursor-pointer" onClick={() => setImageOpen(true)}>
                  <NFTImage src={image} />
                  <NFTInfoWrapper className="w-[calc(100%-40px)]">
                    <p className="text-base text-white text-center">Sample NFT</p>
                  </NFTInfoWrapper>
                </div>
              </StyledCard>

              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Button
                      variant="text"
                      className="w-full"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      Copy link
                      {menuOpen ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                    {menuOpen && (
                      <div className="absolute left-1/2 z-10 -translate-x-1/2 mt-1 min-w-[140px] rounded border border-border bg-popover shadow-md">
                        {[
                          { label: 'Video', link: getOriginUrl(video) },
                          { label: 'Image', link: getOriginUrl(image) },
                          { label: 'Detail Page', link: window.location.href },
                        ].map(({ label, link }) => (
                          <PrimaryMenuItem
                            key={label}
                            onClick={() => {
                              copy(link);
                              setMenuOpen(false);
                            }}
                          >
                            <span>{label}</span>
                          </PrimaryMenuItem>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-md mx-auto w-full md:max-w-none">
              <SectionCard sectionId="sample-meta" title="Token metadata" description="Static sample values for this demo page.">
                <DefinitionList>
                  <DetailRow label="Token name">Sample NFT</DetailRow>
                  <DetailRow label="Seed">
                    <span className="font-mono text-[13px] break-all">
                      3c8510e4cbe870a700d7c44b05f2cdf84824fcd8108aaaafd7952222590b31de
                    </span>
                  </DetailRow>
                </DefinitionList>
              </SectionCard>
            </div>
          </div>

          <div className="mt-20">
            <NFTVideo image_thumb={image} onClick={() => handlePlayVideo(video)} />
          </div>

          <Lightbox
            open={isImageOpen}
            close={() => setImageOpen(false)}
            slides={[{ src: image }]}
          />

          <VideoPlayerDialog
            open={isVideoOpen}
            videoPath={videoPath}
            onClose={() => {
              setVideoOpen(false);
              setVideoPath(null);
            }}
          />
        </SectionWrapper>
      </div>
    </MainWrapper>
  );
};

export default SampleDetailPage;
