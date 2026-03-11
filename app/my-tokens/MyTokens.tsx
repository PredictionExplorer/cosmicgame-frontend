'use client';

import { MainWrapper } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import { useCSTTokensByUser } from '@/hooks/useApiQuery';
import { CSTTable } from '@/components/tokens/CSTTable';

function MyWallet() {
  const { account } = useActiveWeb3React();
  const { data: tokensRaw, isLoading: loading, isError: hasError } = useCSTTokensByUser(account);
  const tokens = tokensRaw ?? [];
  const error = hasError ? 'Failed to load CST tokens.' : null;

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-2">
        My Cosmic Signature (ERC721) Tokens
      </h4>

      {!account ? (
        <p className="text-base">Please login to Metamask to see your tokens.</p>
      ) : loading ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : error ? (
        <p className="text-lg font-semibold text-destructive">{error}</p>
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
