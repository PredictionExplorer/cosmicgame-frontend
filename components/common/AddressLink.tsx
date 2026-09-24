import { useTranslations } from 'next-intl';

import { checksumAddress, findKnownAddress, formatAddress, isZeroAddress } from '@/utils/format';
import { Link } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

/**
 * A linked address in a table cell or a sentence: the one short form
 * (0x1Ec1…E990) at every width, never wrapping, with the full checksummed
 * address in a tooltip; protocol contracts read by name. Opens its target in
 * a new tab so the table keeps its place.
 *
 * Prefer `<AddressChip>` (components/ui/address-chip.tsx) in new code: it
 * adds copy, the imprint/consumption and own-address labels.
 */
export const AddressLink = ({ address, url }: { address: string; url: string }) => {
  const t = useTranslations('formats');
  const contracts = useContractAddresses();

  // The zero address is not a participant: name it instead of linking 0x0000…0000.
  if (isZeroAddress(address)) {
    return <span className="whitespace-nowrap">{t('address.zero')}</span>;
  }

  const known = findKnownAddress(address, contracts);
  const full = checksumAddress(address);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            known
              ? 'whitespace-nowrap [color:inherit] [font-size:inherit]'
              : 'whitespace-nowrap font-mono [color:inherit] [font-size:inherit]'
          }
        >
          {known ? t(`address.known.${known}`) : formatAddress(address)}
        </Link>
      </TooltipTrigger>
      <TooltipContent className="font-mono">{full}</TooltipContent>
    </Tooltip>
  );
};
