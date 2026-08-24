'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { SectionDivider } from '@/components/ui/section-divider';

import type { ContractEntry } from '../contractAddressData';

import { ContractAddressCard } from './ContractAddressCard';
import { ContractSearch } from './ContractSearch';

export type { ContractEntry };

interface ContractAddressGridProps {
  contracts: ContractEntry[];
  explorerUrl: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CATEGORY_ORDER: ContractEntry['category'][] = ['core', 'wallet', 'anchoring'];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function ContractAddressGrid({
  contracts,
  explorerUrl,
  searchTerm,
  onSearchChange,
}: ContractAddressGridProps) {
  const t = useTranslations('contracts');
  const lowerSearch = searchTerm.toLocaleLowerCase('en-US');
  const filtered = searchTerm
    ? contracts.filter(
        (c) =>
          c.name.toLocaleLowerCase('en-US').includes(lowerSearch) ||
          c.address.toLocaleLowerCase('en-US').includes(lowerSearch),
      )
    : contracts;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: t(`categories.${cat}`),
    items: filtered.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <ContractSearch value={searchTerm} onChange={onSearchChange} />

      {grouped.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('search.empty', { searchTerm })}
        </p>
      )}

      {grouped.map((group) => (
        <div key={group.category} className="mb-6">
          <SectionDivider title={group.label} className="mb-4" />
          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {group.items.map((contract) => (
              <motion.div key={contract.address || contract.name} variants={fadeUp}>
                <ContractAddressCard
                  name={contract.name}
                  address={contract.address}
                  description={contract.description}
                  explorerUrl={explorerUrl}
                  showTradeAction={contract.id === 'cst'}
                  showPoolAction={contract.id === 'cst'}
                  showMarketplaceAction={contract.id === 'nft'}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
