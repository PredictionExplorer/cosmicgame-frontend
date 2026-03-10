'use client';

import { useCallback, useEffect, useState } from 'react';

import { MainWrapper } from '@/components/styled';
import { reportError } from '@/utils/errors';
import { useActiveWeb3React } from '@/hooks/web3';
import { useApiData } from '@/contexts/ApiDataContext';
import api from '@/services/api';
import { CSTTable, type CSTToken } from '@/components/tokens/CSTTable';

function useUserCSTTokens(account: string | null | undefined) {
  const [tokens, setTokens] = useState<CSTToken[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(
    async (showLoading = true) => {
      if (!account) return;

      try {
        if (showLoading) setLoading(true);
        const cstList = await api.get_cst_tokens_by_user(account);
        setTokens(cstList as unknown as CSTToken[]);
      } catch (err) {
        reportError(err, 'fetch user CST tokens');
        setError('Failed to load CST tokens.');
        setTokens([]);
      } finally {
        setLoading(false);
      }
    },
    [account],
  );

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return { tokens, loading, error, refetch: fetchTokens };
}

function MyWallet() {
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();

  const { tokens, loading, error, refetch } = useUserCSTTokens(account);

  useEffect(() => {
    if (account) {
      refetch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, account]);

  return (
    <MainWrapper>
      <h4 className="text-2xl font-bold text-primary text-center mb-2">
        My Cosmic Signature (ERC721) Tokens
      </h4>

      {!account ? (
        <p className="text-base">Please login to Metamask to see your tokens.</p>
      ) : loading ? (
        <h6 className="text-lg font-semibold">Loading...</h6>
      ) : error ? (
        <h6 className="text-lg font-semibold text-destructive">{error}</h6>
      ) : (
        <div className="mt-12">
          <h6 className="text-lg font-semibold mb-4">Cosmic Signature Tokens I Own</h6>
          <CSTTable list={tokens} />
        </div>
      )}
    </MainWrapper>
  );
}

export default MyWallet;
