'use client';

import type { ReactNode } from 'react';

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
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-center sm:px-5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">{children}</div>
    </div>
  );
}

const AdminSettingsPage = () => {
  const { data, isLoading } = useDashboardInfo();

  return (
    <PageShell variant="data" className="max-sm:pb-16">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Administrative methods"
          subtitle="Read-only view of dashboard contract addresses and parameters."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin' },
            { label: 'Settings' },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {isLoading || !data ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <SectionCard
            sectionId="admin-cosmic-contract"
            title="Cosmic Signature Contract"
            description="Contract addresses and on-chain parameters from the dashboard API."
          >
            <div>
              <AdminFieldRow label="Cosmic Signature Token (ERC721) contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.CosmicSignatureAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Cosmic Token (ERC20) contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.CosmicTokenAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Public Goods Vault contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.CharityWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="RandomWalk NFT contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.RandomWalkAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Stellar Selection wallet contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.RaffleWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Anchoring wallet contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.StakingWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Outreach wallet contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.MarketingWalletAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Business logic contract address">
                <Input
                  placeholder="Enter address here"
                  className="flex-1 font-mono text-sm"
                  value={String(data?.ContractAddrs?.BusinessLogicAddr ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set Address
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Number of ETH Stellar Selection recipients per cycle">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.NumRaffleEthWinners ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Number of NFT Stellar Selection recipients per cycle">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.NumRaffleNFTWinners ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Number of NFT holder recipients per cycle">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.NumHolderNFTWinners ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Signature Allocation percentage">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.PrizePercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Public Goods percentage">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.CharityPercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Stellar Selection percentage">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.RafflePercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Anchor Distribution percentage">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.StakingPercentage ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Time increase">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.TimeIncrease ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Timeout to retrieve Signature Allocation">
                <Input type="number" placeholder="Enter number here" className="flex-1" />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Price increase">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.PriceIncrease ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Nano seconds extra">
                <Input
                  type="number"
                  placeholder="Enter number here"
                  className="flex-1"
                  value={String(data?.NanosecondsExtra ?? '')}
                  readOnly
                />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Initial seconds until Signature Allocation">
                <Input type="number" placeholder="Enter number here" className="flex-1" />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Initial Gesture Cost fraction">
                <Input type="number" placeholder="Enter number here" className="flex-1" />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Activation time">
                <Input type="number" placeholder="Enter number here" className="flex-1" />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="ETH to CST Gesture ratio">
                <Input type="number" placeholder="Enter number here" className="flex-1" />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Cycle start CST Calibration Window length">
                <Input type="number" placeholder="Enter number here" className="flex-1" />
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
                </Button>
              </AdminFieldRow>
              <AdminFieldRow label="Switch mode">
                <Select defaultValue="runtime">
                  <SelectTrigger className="w-full flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runtime">Runtime Mode</SelectItem>
                    <SelectItem value="maintenance">Maintenance Mode</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary" className="shrink-0 w-full sm:ml-2 sm:w-auto">
                  Set
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
