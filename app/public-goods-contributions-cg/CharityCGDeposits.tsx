'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits } from '@/hooks/useApiQuery';

const CharityCGDeposits = () => {
  const { data: charityCGDeposits = [], isLoading: loading } = useCharityCGDeposits();

  return (
    <MainWrapper>
      <PageHeader
        title="Protocol Public-Goods Contributions"
        subtitle="Automatic forwards from the Cosmic Signature protocol to the Public Goods Vault"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Each cycle, a percentage of the Cycle Reserve is automatically forwarded to the Public Goods
        Vault. The Cosmic Council coordinates which public-goods beneficiaries receive these funds,
        creating a direct link between participation and ecosystem impact.
      </p>
      {loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : (
        <CharityDepositTable list={charityCGDeposits as PublicGoodsContributionEntry[]} />
      )}
    </MainWrapper>
  );
};

export default CharityCGDeposits;
