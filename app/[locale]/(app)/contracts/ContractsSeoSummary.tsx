import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { networkConfig } from '@/config/networks';
import { get_dashboard_info } from '@/services/api/rounds';

import { getSeoContractAddressEntries } from './contractAddressData';

export async function ContractsSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'contracts' });
  const labels = {
    CosmicGameAddr: t('entries.protocol.name'),
    ImplementationAddr: t('entries.implementation.name'),
    CosmicTokenAddr: t('entries.cst.name'),
    CosmicSignatureAddr: t('entries.nft.name'),
    RandomWalkAddr: t('entries.randomWalk.name'),
    CosmicDaoAddr: t('entries.council.name'),
    CharityWalletAddr: t('entries.publicGoods.name'),
    PrizesWalletAddr: t('entries.allocations.name'),
    StakingWalletCSTAddr: t('entries.cosmicAnchor.name'),
    StakingWalletRWalkAddr: t('entries.rwalkAnchor.name'),
    MarketingWalletAddr: t('entries.outreach.name'),
  };
  // Resolve to null on transport failure so ISR builds never crash on a
  // temporarily unreachable API; verified fallback addresses render instead.
  const data = await get_dashboard_info().catch(() => null);
  const entries = getSeoContractAddressEntries(data?.ContractAddrs, labels).map(
    ({ key, label, address }) => ({
      key,
      label,
      address,
      explorerUrl: `${networkConfig.explorerUrl.replace(/\/$/, '')}/address/${address}`,
    }),
  );

  return (
    <section
      aria-labelledby="contracts-seo-heading"
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">{t('seo.eyebrow')}</p>
      <h1 id="contracts-seo-heading" className="mt-4 type-display-md text-foreground">
        {t('seo.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">{t('seo.description')}</p>
      {!data?.ContractAddrs ? (
        <p className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-muted-foreground">
          {t('seo.partialFallback')}
        </p>
      ) : null}
      {entries.length > 0 ? (
        <dl className="mt-6 grid gap-3 md:grid-cols-2">
          {entries.map(({ key, label, address, explorerUrl }) => (
            <div key={key} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <dt className="text-sm font-semibold text-foreground">{label}</dt>
              <dd className="mt-2 break-all font-mono text-xs text-muted-foreground">
                <a href={explorerUrl} className="text-primary underline-offset-4 hover:underline">
                  {address}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-6 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-muted-foreground">
          {t('seo.empty')}
        </p>
      )}
      <nav aria-label={t('seo.relatedAria')} className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              {t('seo.links.code')}
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-primary underline-offset-4 hover:underline">
              {t('seo.links.security')}
            </Link>
          </li>
          <li>
            <Link href="/audits" className="text-primary underline-offset-4 hover:underline">
              {t('seo.links.audits')}
            </Link>
          </li>
          <li>
            <Link
              href="/risk-disclosures"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t('seo.links.risk')}
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
