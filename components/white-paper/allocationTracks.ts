import type { LandingEthTrack } from '@/content/landing';
import type { WhitePaperContent } from '@/content/white-paper';

/** Keep figure widths and labels tied to the edition's allocation table. */
export function whitePaperAllocationTracks(
  content: WhitePaperContent,
  tracks: readonly LandingEthTrack[],
): LandingEthTrack[] {
  const table = content.sections
    .flatMap((section) => section.subsections ?? [])
    .find((section) => section.id === 'distribution-at-finalization')
    ?.blocks.find((block) => block.kind === 'table');

  return tracks.map((track, index) => {
    const row = table?.table.rows[index];
    return {
      ...track,
      title: row?.[0] ?? track.title,
      share: Number(row?.[1]?.match(/\d+/)?.[0] ?? track.share),
      percent: row?.[1]?.match(/^.*?[%％]/)?.[0] ?? track.percent,
    };
  });
}
