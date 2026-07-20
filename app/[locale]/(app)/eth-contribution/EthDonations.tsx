'use client';

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

const EthDonations = () => {
  const t = useTranslations('toasts');
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
        text: t('contribution.connectWallet'),
        type: 'error',
        visible: true,
      });
      return;
    }
    if (!cosmicGameContract) {
      setNotification({
        text: t('contribution.contractUnavailable'),
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
        text: t('contribution.submitted', { amount: donateAmount }),
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      refetchDonations();
    } catch (error: unknown) {
      if (isUserRejection(error)) {
        setNotification({
          text: t('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'Contribution error');
        setNotification({
          text: t('contribution.failed'),
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
        text: t('contribution.connectWallet'),
        type: 'error',
        visible: true,
      });
      return;
    }
    if (!cosmicGameContract) {
      setNotification({
        text: t('contribution.contractUnavailable'),
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
        text: t('contribution.submittedWithInfo', { amount: donateAmount }),
        type: 'success',
        visible: true,
      });

      setDonateAmount('');
      setDonationInformation('');
      refetchDonations();
    } catch (error: unknown) {
      if (isUserRejection(error)) {
        setNotification({
          text: t('walletTransactionCancelled'),
          type: 'info',
          visible: true,
        });
      } else {
        reportError(error, 'Contribution with info error');
        setNotification({
          text: t('contribution.failedWithInfo'),
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
      <PageHeader
        title="ETH Contributions"
        titleLevel={2}
        subtitle="Contribute ETH directly to the Cosmic Signature Public Goods Vault"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        Contribute ETH directly to the Cosmic Signature Public Goods Vault to support beneficiaries
        selected through Cosmic Council coordination. You can include an optional title, message,
        and URL with your contribution. Top contributors for each cycle may be featured on the home
        page.
      </p>

      {!!account && (
        <div className="mb-12 rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Make a Contribution
          </h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Amount (ETH)</Label>
            <div className="flex items-center gap-2">
              <Input
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
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Information <span className="opacity-50">(optional, JSON)</span>
            </Label>
            <textarea
              value={donateInformation}
              rows={3}
              className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              placeholder='{"name": "Your Name", "message": "..."}'
              onChange={(e) => setDonationInformation(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              disabled={!donateAmount || donateAmount === '0' || submitting !== null}
              onClick={handleDonate}
            >
              {submitting === 'plain' ? t('contribution.submitting') : 'Contribute'}
            </Button>
            <Button
              variant="outline"
              disabled={!donateAmount || donateAmount === '0' || submitting !== null}
              onClick={handleDonateWithInfo}
            >
              {submitting === 'withInfo' ? t('contribution.submitting') : 'Contribute with Info'}
            </Button>
          </div>
        </div>
      )}

      <SectionDivider title="Contribution History" className="mb-6" />
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
