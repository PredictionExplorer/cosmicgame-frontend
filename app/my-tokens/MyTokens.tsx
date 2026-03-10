'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

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
  }, [status, account]);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        My Cosmic Signature (ERC721) Tokens
      </Typography>

      {!account ? (
        <Typography variant="subtitle1">Please login to Metamask to see your tokens.</Typography>
      ) : loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : error ? (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      ) : (
        <Box mt={6}>
          <Typography variant="h6" mb={2}>
            Cosmic Signature Tokens I Own
          </Typography>
          <CSTTable list={tokens} />
        </Box>
      )}
    </MainWrapper>
  );
}

export default MyWallet;
