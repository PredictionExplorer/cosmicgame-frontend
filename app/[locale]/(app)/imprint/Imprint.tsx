'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatEther, parseEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { parseBalance } from '@/utils';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/page-shell';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { useActiveWeb3React } from '@/hooks/web3';
import { asWriteFn } from '@/utils/contractWrite';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';
import { assertSuccessfulTransactionReceipt } from '@/utils/transactions';

const Imprint = () => {
  const t = useTranslations('imprint');
  const toastT = useTranslations('toasts');
  const locale = useLocale();
  const [imprintCost, setImprintCost] = useState('0');
  const [nftIds, setNftIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { account } = useActiveWeb3React();
  const publicClient = usePublicClient();
  const nftContract = useRWLKNFTContract();

  const handleImprint = async () => {
    if (!nftContract) {
      toast.error(toastT('imprint.contractUnavailable'));
      return;
    }
    setIsSubmitting(true);
    try {
      const abiImprintCost = (await nftContract.read.getMintPrice?.()) as bigint; // lexicon-allow-abi
      const newPrice = parseFloat(formatEther(abiImprintCost)) * 1.01;

      const hash = await asWriteFn(nftContract.write.mint)({
        // lexicon-allow-abi
        value: parseEther(newPrice.toFixed(6)),
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);
      toast.success(toastT('imprint.confirmed'));
    } catch (err: unknown) {
      if (isUserRejection(err)) {
        toast.info(toastT('walletTransactionCancelled'));
        return;
      }
      reportError(err, 'imprint RWLK NFT');
      toast.error(getEthErrorMessage(err, toastT('imprint.failed'), { locale }));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const abiImprintCost = (await nftContract!.read.getMintPrice?.()) as bigint; // lexicon-allow-abi
      setImprintCost((parseFloat(parseBalance(abiImprintCost)) * 1.01 + 0.008).toFixed(4));
    };
    if (nftContract) {
      getData();
    }
  }, [nftContract]);

  useEffect(() => {
    const getTokens = async () => {
      try {
        const tokens = (await nftContract!.read.walletOfOwner?.([account])) as readonly bigint[];
        const nftIds = tokens
          .map((t) => Number(t))
          .sort()
          .reverse();
        setNftIds(nftIds);
      } catch (err) {
        reportError(err, 'get user NFT tokens');
      }
    };

    if (account && nftContract) {
      getTokens();
    }
  }, [nftContract, account]);

  return (
    <PageShell variant="form">
      <PageHeader title={t('page.title')} titleLevel={2} subtitle={t('page.subtitle')} />

      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('page.description')}
      </p>

      <div className="flex flex-col items-center">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-transparent p-8 text-center max-w-md w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-3xl font-bold font-display">
            {imprintCost} <span className="text-primary">ETH</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">{t('page.currentCost')}</p>
          <Button size="lg" onClick={handleImprint} className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? toastT('imprint.imprinting') : t('page.submit')}
          </Button>
        </div>
      </div>

      {nftIds.length > 0 && (
        <div className="mt-16">
          <SectionDivider title={t('page.myNfts')} className="mb-6" />
          <div className="flex flex-wrap gap-2">
            {nftIds.map((tokenId) => (
              <Link
                key={tokenId}
                href={`/?randomwalk=true&tokenId=${tokenId}`}
                className="inline-flex items-center rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-sm font-mono hover:bg-white/[0.06] transition-colors"
              >
                #{tokenId}
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Imprint;
