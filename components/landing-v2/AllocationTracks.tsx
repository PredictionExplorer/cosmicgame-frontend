import type { LandingContent } from '@/content/landing';

import { cn } from '@/lib/utils';

import { AllocationBar, trackFill } from './AllocationBar';
import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * Allocation Tracks: where a cycle's ETH goes, as one bar drawn to scale
 * against 100% (the same order and colours as every chart of the split in
 * the app), a legend with each track's share and purpose, and the fixed CST
 * and NFT allocations beside it. Server-rendered and visible without
 * JavaScript; the bar is decorative and the legend carries every figure.
 */
export function AllocationTracks({ tracks }: { tracks: LandingContent['tracks'] }) {
  return (
    <LandingSection id="tracks" labelledBy="landing-tracks-heading">
      <SectionHeading
        eyebrow={tracks.eyebrow}
        heading={tracks.heading}
        headingId="landing-tracks-heading"
        description={tracks.description}
        layout="split"
      />

      <div className={styles.split}>
        <h3 className="type-label text-subtle" id="landing-tracks-eth">
          {tracks.ethLabel}
        </h3>
        <AllocationBar tracks={tracks.eth} className="mt-4" />
        <ul className={styles.legend} aria-labelledby="landing-tracks-eth">
          {tracks.eth.map((track) => (
            <li key={track.id} className={styles.legendItem}>
              <span aria-hidden="true" className={cn(styles.swatch, trackFill(track.id))} />
              <h4 className="type-title">{track.title}</h4>
              <span className="type-figure-md text-right">{track.percent}</span>
              <p className={cn('type-body-sm text-muted-foreground', styles.legendBody)}>
                {track.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.fixed}>
        <h3 className="type-label text-subtle" id="landing-tracks-fixed">
          {tracks.fixedLabel}
        </h3>
        {/* What each recipient receives, once; the figures below count recipients. */}
        <p className="type-body-md mt-2 text-muted-foreground" id="landing-tracks-fixed-each">
          {tracks.fixedEach}
        </p>
        <ul
          className={styles.fixedList}
          aria-labelledby="landing-tracks-fixed"
          aria-describedby="landing-tracks-fixed-each"
        >
          {tracks.fixed.map((track) => (
            <li key={track.id} className={styles.fixedItem}>
              <span className="type-figure-md">{track.amount}</span>
              <h4 className="type-title mt-3">{track.title}</h4>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{track.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </LandingSection>
  );
}
