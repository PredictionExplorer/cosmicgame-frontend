'use client';

import { motion } from 'framer-motion';

import { SectionDivider } from '@/components/ui/section-divider';

import { ContractAddressCard } from './ContractAddressCard';
import { ContractSearch } from './ContractSearch';

export interface ContractEntry {
  name: string;
  address: string;
  description: string;
  category: 'core' | 'wallet' | 'staking';
}

interface ContractAddressGridProps {
  contracts: ContractEntry[];
  explorerUrl: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CATEGORY_LABELS: Record<ContractEntry['category'], string> = {
  core: 'Core Contracts',
  wallet: 'Wallet Contracts',
  staking: 'Staking Contracts',
};

const CATEGORY_ORDER: ContractEntry['category'][] = ['core', 'wallet', 'staking'];

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
  const lowerSearch = searchTerm.toLowerCase();
  const filtered = searchTerm
    ? contracts.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerSearch) ||
          c.address.toLowerCase().includes(lowerSearch),
      )
    : contracts;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: filtered.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <ContractSearch value={searchTerm} onChange={onSearchChange} />

      {grouped.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No contracts match &ldquo;{searchTerm}&rdquo;
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
              <motion.div key={contract.name} variants={fadeUp}>
                <ContractAddressCard
                  name={contract.name}
                  address={contract.address}
                  description={contract.description}
                  explorerUrl={explorerUrl}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
