import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Ratchet for the formatting layer (utils/format.ts): numbers on screen go
 * through `formatAmount` / `formatCount` / `formatPercent` / `<Amount>`, which
 * group digits, follow the locale and apply one precision policy. A raw
 * `toFixed` (or its total twin `formatFixed`) does none of that: "60872.26
 * CST" beside "1,135", 4 digits in one card and 2 in the next.
 *
 * Files that still use them are listed with their exact current count. The
 * count may only go down, and the entry must follow it: migrate a call site,
 * then lower (or delete) its entry in the same change, so freed slack can
 * never be spent again. A new file starts at zero. Machine values that are
 * not displayed (a `parseEther` argument, a CSS width) may stay, with their
 * count kept here.
 */

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(path);
    return /\.[jt]sx?$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : [];
  });
}

const ROOT = process.cwd();
const FILES = ['app', 'components'].flatMap((directory) => sourceFiles(join(ROOT, directory)));

const FIXED_DECIMAL_CALL = /\.toFixed\(|\bformatFixed\(/g;

/** Remaining fixed-decimal calls per file; lower as call sites migrate. */
const FIXED_DECIMAL_BASELINE: Readonly<Record<string, number>> = {
  'app/[locale]/(app)/cosmic-token-transfer/[address]/CosmicTokenTransfersPage.tsx': 1,
  'app/[locale]/(app)/eth-contribution/detail/[id]/EthDonationDetailPage.tsx': 1,
  'components/marketing/MarketingStats.tsx': 1,
  'components/marketing/TopMarketersLeaderboard.tsx': 1,
  'components/nft/traits/ChaosMeter.tsx': 1,
  'components/nft/traits/NftTraitPanel.tsx': 1,
  'components/nft/traits/palette.ts': 2,
  'components/tokens/CstTransferForm.tsx': 2,
  'components/tokens/MarketingCstRewardForm.tsx': 2,
  'components/ui/stat-card.tsx': 1,
};

/**
 * Private amount formatters that predate the layer. Nothing new joins this
 * list; each entry goes away when its file migrates to `formatAmount`.
 */
const LOCAL_AMOUNT_FORMATTER = /\b(?:function|const)\s+format(?:Eth|Cst|CST|EthValue|Amount)\b/;
const LOCAL_AMOUNT_FORMATTER_BASELINE: readonly string[] = [];

const fixedDecimalCount = (file: string): number =>
  (readFileSync(join(ROOT, file), 'utf8').match(FIXED_DECIMAL_CALL) ?? []).length;

const declaresLocalAmountFormatter = (file: string): boolean =>
  LOCAL_AMOUNT_FORMATTER.test(readFileSync(join(ROOT, file), 'utf8'));

describe('formatting call sites', () => {
  const files = FILES.map((path) => relative(ROOT, path));

  it('adds no raw toFixed/formatFixed display formatting', () => {
    const grown = files.flatMap((file) => {
      const count = fixedDecimalCount(file);
      const allowed = FIXED_DECIMAL_BASELINE[file] ?? 0;
      return count > allowed
        ? [`${file}: ${count} fixed-decimal call(s), baseline ${allowed} — use formatAmount`]
        : [];
    });
    expect(grown).toEqual([]);
  });

  it('lowers a baseline in the same change that migrates its call sites', () => {
    const slack = Object.entries(FIXED_DECIMAL_BASELINE).flatMap(([file, allowed]) => {
      const count = files.includes(file) ? fixedDecimalCount(file) : 0;
      return count < allowed
        ? [
            `${file}: baseline ${allowed}, now ${count} — ${
              count ? `lower the entry to ${count}` : 'delete the entry'
            }`,
          ]
        : [];
    });
    expect(slack).toEqual([]);
  });

  it('declares no new private amount formatters', () => {
    const declared = files
      .filter((file) => !LOCAL_AMOUNT_FORMATTER_BASELINE.includes(file))
      .filter(declaresLocalAmountFormatter);
    expect(declared).toEqual([]);
  });

  it('drops a private formatter from its baseline once the file has migrated', () => {
    const migrated = LOCAL_AMOUNT_FORMATTER_BASELINE.filter(
      (file) => files.includes(file) && !declaresLocalAmountFormatter(file),
    );
    expect(migrated).toEqual([]);
  });

  it('keeps the baselines pointing at real files', () => {
    const stale = [
      ...Object.keys(FIXED_DECIMAL_BASELINE),
      ...LOCAL_AMOUNT_FORMATTER_BASELINE,
    ].filter((file) => !files.includes(file));
    expect(stale).toEqual([]);
  });
});
