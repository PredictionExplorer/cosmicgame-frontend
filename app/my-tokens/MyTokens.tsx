'use client';

import { MainWrapper } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import { useCSTTokensByUser } from '@/hooks/useApiQuery';
import { CSTTable } from '@/components/tokens/CSTTable';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';

function MyWallet() {
  const { account } = useActiveWeb3React();
  const { data: tokensRaw, isLoading: loading, isError: hasError } = useCSTTokensByUser(account);
  const tokens = tokensRaw ?? [];
  const error = hasError ? 'Failed to load CST tokens.' : null;

  return (
    <MainWrapper>
      <PageHeader
        title="My Cosmic Signature Tokens"
        subtitle="ERC721 tokens in your connected wallet"
      />

      {!account ? (
        <EmptyState
          title="Wallet not connected"
          description="Please connect your wallet to view your tokens."
        />
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load tokens" message={error} />
      ) : (
        <div className="mt-12">
          <h5 className="text-lg font-semibold mb-4">Cosmic Signature Tokens I Own</h5>
          <CSTTable list={tokens} />
        </div>
      )}
    </MainWrapper>
  );
}

export default MyWallet;
