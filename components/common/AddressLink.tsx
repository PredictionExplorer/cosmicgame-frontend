import { shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

export const AddressLink = ({ address, url }: { address: string; url: string }) => {
  const { marketing } = useContractAddresses();
  const isMkt = marketing && address && marketing.toLowerCase() === address.toLowerCase();
  const displayText = isMkt ? 'Marketing Wallet' : address;
  const shortText = isMkt ? 'Marketing Wallet' : shortenHex(address, 6);

  return (
    <>
      {/* Mobile: tooltip with shortened address */}
      <span className="sm:hidden">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono [color:inherit] [font-size:inherit]"
            >
              {shortText}
            </a>
          </TooltipTrigger>
          <TooltipContent>{address}</TooltipContent>
        </Tooltip>
      </span>

      {/* Desktop: full address */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden font-mono [color:inherit] [font-size:inherit] sm:inline"
      >
        {displayText}
      </a>
    </>
  );
};
