import { shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MARKETING_WALLET_ADDRESS } from '@/config/networks';

export const AddressLink = ({ address, url }: { address: string; url: string }) => {
  const displayText = address === MARKETING_WALLET_ADDRESS ? 'Marketing Wallet' : address;
  const shortText =
    address === MARKETING_WALLET_ADDRESS ? 'Marketing Wallet' : shortenHex(address, 6);

  return (
    <>
      {/* Mobile: tooltip with shortened address */}
      <span className="sm:hidden">
        <TooltipProvider>
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
        </TooltipProvider>
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
