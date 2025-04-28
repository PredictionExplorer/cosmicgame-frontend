import { Link, Tooltip } from "@mui/material";
import { isMobile } from "react-device-detect"; // Used to detect if the user is on a mobile device
import { shortenHex } from "../utils"; // Utility function to shorten hex address
import { MARKETING_WALLET_ADDRESS } from "../config/app"; // Marketing wallet address from config

// AddressLink component to display a formatted link with address
export const AddressLink = ({
  address,
  url,
}: {
  address: string;
  url: string;
}) => {
  // Conditional rendering based on whether the user is on mobile or desktop
  return (
    <>
      {isMobile ? (
        // If on mobile, show the address inside a tooltip for better UX
        <Tooltip title={address}>
          <Link
            href={url} // The link directs to the provided URL
            target="_blank" // Opens the link in a new tab
            style={{
              color: "inherit", // Inherit text color
              fontSize: "inherit", // Inherit font size
              fontFamily: "monospace", // Monospace font for address appearance
            }}
          >
            {/* Conditionally render 'Marketing Wallet' text for specific address */}
            {address === MARKETING_WALLET_ADDRESS
              ? "Marketing Wallet" // Display 'Marketing Wallet' if it matches the marketing address
              : shortenHex(address, 6)}
            {/* Shorten address to first 6 characters */}
          </Link>
        </Tooltip>
      ) : (
        // If not on mobile, just display the full address as a link
        <Link
          href={url}
          style={{
            color: "inherit", // Inherit text color
            fontSize: "inherit", // Inherit font size
            fontFamily: "monospace", // Monospace font for address appearance
          }}
        >
          {/* Conditionally render 'Marketing Wallet' text or the full address */}
          {address === MARKETING_WALLET_ADDRESS
            ? "Marketing Wallet" // Display 'Marketing Wallet' if it matches the marketing address
            : address}
          {/* Otherwise, display the full address */}
        </Link>
      )}
    </>
  );
};
