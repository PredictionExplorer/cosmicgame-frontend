'use client';

import { useId, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionCard, detailPanelClass } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

function AdminFieldRow({ label, children }: { label: string; children: ReactNode }) {
  const labelId = useId();

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-center sm:px-5">
      <span id={labelId} className="text-sm font-medium text-foreground">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center"
      >
        {children}
      </div>
    </div>
  );
}

const AdminSettingsPage = () => {
  const t = useTranslations('admin');
  const { data, isLoading } = useDashboardInfo();

  return (
    <PageShell variant="data" className="max-sm:pb-16">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title={t('settings.title')}
          subtitle={t('settings.subtitle')}
          breadcrumbs={[
            { label: t('settings.breadcrumbs.home'), href: '/' },
            { label: t('settings.breadcrumbs.admin'), href: '/admin' },
            { label: t('settings.breadcrumbs.settings') },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {isLoading || !data ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground" role="status">
              {t('settings.loading')}
            </p>
          </div>
        ) : (
          <SectionCard
            sectionId="admin-cosmic-contract"
            title={t('settings.contractTitle')}
            description={t('settings.contractDescription')}
          >
            <div>
              <AdminFieldRow label={t('settings.fields.cosmicSignatureNft')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.CosmicSignatureAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.cstToken')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.CosmicTokenAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.publicGoodsVault')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.CharityWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.randomWalkNft')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.RandomWalkAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.stellarSelectionWallet')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.RaffleWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.anchoringWallet')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.StakingWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.outreachWallet')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.MarketingWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.businessLogic')}>
                <Input
                  placeholder={t('settings.placeholders.address')}
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.BusinessLogicAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.setAddress')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.ethStellarRecipients')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.NumRaffleEthWinners ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.nftStellarRecipients')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.NumRaffleNFTWinners ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.nftHolderRecipients')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.NumHolderNFTWinners ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.signatureAllocationPercentage')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.PrizePercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.publicGoodsPercentage')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.CharityPercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.stellarSelectionPercentage')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.RafflePercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.anchorDistributionPercentage')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.StakingPercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.timeIncrease')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.TimeIncrease ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.allocationTimeout')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.priceIncrease')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.PriceIncrease ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.nanosecondsExtra')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                  value={String(data?.NanosecondsExtra ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.initialAllocationSeconds')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.initialGestureCostFraction')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.activationTime')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.gestureRatio')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.calibrationWindowLength')}>
                <Input
                  type="number"
                  placeholder={t('settings.placeholders.number')}
                  className="flex-1"
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label={t('settings.fields.switchMode')}>
                <Select defaultValue="runtime">
                  <SelectTrigger className="w-full flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runtime">{t('settings.modes.runtime')}</SelectItem>
                    <SelectItem value="maintenance">{t('settings.modes.maintenance')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  {t('settings.actions.set')}
                </Button>
              </AdminFieldRow>
            </div>
          </SectionCard>
        )}
      </div>
    </PageShell>
  );
};

export default AdminSettingsPage;
