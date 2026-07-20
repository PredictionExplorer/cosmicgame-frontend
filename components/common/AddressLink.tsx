import { useTranslations } from 'next-intl';

import { shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

export const AddressLink = ({ address, url }: { address: string; url: string }) => {
  const t = useTranslations('marketing');
  const { marketing } = useContractAddresses();
  const isMkt = marketing && address && marketing.toLowerCase() === address.toLowerCase();
  const displayText = isMkt ? t('address.outreachWallet') : address;
  const shortText = isMkt ? t('address.outreachWallet') : shortenHex(address, 6);

  return (
    <>
      {/* Mobile: tooltip with shortened address */}
      <span className="sm:hidden">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono [color:inherit] [font-size:inherit]"
            >
              {shortText}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{address}</TooltipContent>
        </Tooltip>
      </span>

      {/* Desktop: full address */}
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden font-mono [color:inherit] [font-size:inherit] sm:inline"
      >
        {displayText}
      </Link>
    </>
  );
};
