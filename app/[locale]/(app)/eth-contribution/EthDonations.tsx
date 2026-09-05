'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { parseEther } from 'viem';
import { usePublicClient } from 'wagmi';

import { PageShell } from '@/components/ui/page-shell';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionDivider } from '@/components/ui/section-divider';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDonationsBoth } from '@/hooks/useApiQuery';
import EthDonationTable, { EthDonation } from '@/components/tables/EthDonationTable';
import { useNotification } from '@/contexts/NotificationContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { asWriteFn } from '@/utils/contractWrite';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { isUserRejection, reportError } from '@/utils/errors';
import { assertSuccessfulTransactionReceipt } from '@/utils/transactions';

const EthDonations = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('ethContribution');
  const tToast = useTranslations('toasts');
  const [donateAmount, setDonateAmount] = useState('');
  const [donateInformation, setDonationInformation] = useState('');
  const [submitting, setSubmitting] = useState<'plain' | 'withInfo' | null>(null);

  const { setNotification } = useNotification();
  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const publicClient = usePublicClient();
  const { data: donationsRaw, isLoading, refetch: refetchDonations } = useDonationsBoth();
  const charityDonations = (donationsRaw as EthDonation[] | undefined) ?? null;

  const handleDonate = async () => {
    if (!account) {
      setNotification({
        text: tToast('contribution.connectWallet'),
        type: 'error',
        visible: true,
      });
      return;
    }
    if (!cosmicGameContract) {
      setNotification({
        text: tToast('contribution.contractUnavailable'),
        type: 'error',
        visible: true,
      });
      return;
    }
    setSubmitting('plain');
    try {
      const hash = await asWriteFn(cosmicGameContract.write.donateEth)([], {
        value: parseEther(donateAmount),
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);

      setNotification({
        text: tToast('contribution.submitted', { amount: donateAmount }),
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      refetchDonations();
    } catch (error: unknown) {
      if (isUserRejection(error)) {
        setNotification({
          text: tToast('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'Contribution error');
        setNotification({
          text: tToast('contribution.failed'),
          type: 'error',
          visible: true,
        });
      }
    } finally {
      setSubmitting(null);
    }
  };

  const handleDonateWithInfo = async () => {
    if (!account) {
      setNotification({
        text: tToast('contribution.connectWallet'),
        type: 'error',
        visible: true,
      });
      return;
    }
    if (!cosmicGameContract) {
      setNotification({
        text: tToast('contribution.contractUnavailable'),
        type: 'error',
        visible: true,
      });
      return;
    }
    setSubmitting('withInfo');
    try {
      const hash = await asWriteFn(cosmicGameContract.write.donateEthWithInfo)(
        [donateInformation],
        {
          value: parseEther(donateAmount),
        },
      );
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      assertSuccessfulTransactionReceipt(receipt);

      setNotification({
        text: tToast('contribution.submittedWithInfo', { amount: donateAmount }),
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      setDonationInformation('');
      refetchDonations();
    } catch (error: unknown) {
      if (isUserRejection(error)) {
        setNotification({
          text: tToast('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'Contribution with info error');
        setNotification({
          text: tToast('contribution.failedWithInfo'),
          type: 'error',
          visible: true,
        });
      }
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}
      {!seoSummary && (
        <PageHeader title={t('page.title')} titleLevel={2} subtitle={t('page.subtitle')} />
      )}
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        {t('page.description')}
      </p>

      {!!account && (
        <div className="mb-12 rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t('page.formTitle')}
          </h3>
          <div>
            <Label
              htmlFor="eth-contribution-page-amount"
              className="text-xs text-muted-foreground mb-1.5 block"
            >
              {t('page.amountLabel')}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="eth-contribution-page-amount"
                placeholder="0.0"
                type="number"
                value={donateAmount}
                className="max-w-xs"
                onChange={(e) => setDonateAmount(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">ETH</span>
            </div>
          </div>
          <div>
            <Label
              htmlFor="eth-contribution-page-information"
              className="text-xs text-muted-foreground mb-1.5 block"
            >
              {t('page.informationLabel')}{' '}
              <span className="opacity-50">{t('page.optionalJson')}</span>
            </Label>
            <textarea
              id="eth-contribution-page-information"
              value={donateInformation}
              rows={3}
              className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              placeholder={t('page.informationPlaceholder')}
              onChange={(e) => setDonationInformation(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              disabled={!donateAmount || donateAmount === '0' || submitting !== null}
              onClick={handleDonate}
            >
              {submitting === 'plain' ? tToast('contribution.submitting') : t('page.contribute')}
            </Button>
            <Button
              variant="outline"
              disabled={!donateAmount || donateAmount === '0' || submitting !== null}
              onClick={handleDonateWithInfo}
            >
              {submitting === 'withInfo'
                ? tToast('contribution.submitting')
                : t('page.contributeWithInfo')}
            </Button>
          </div>
        </div>
      )}

      <SectionDivider title={t('page.historyTitle')} className="mb-6" />
      {isLoading || charityDonations === null ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <EthDonationTable list={charityDonations} />
      )}
    </PageShell>
  );
};

export default EthDonations;
