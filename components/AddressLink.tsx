import { Link, Tooltip } from "@mui/material";
import { isMobile } from "react-device-detect";
import { shortenHex } from "../utils";

export const AddressLink = ({ address, url }) => {
  return (
    <>
      {isMobile ? (
        <Tooltip title={address}>
          <Link
            href={url}
            target="_blank"
            style={{
              color: "inherit",
              fontSize: "inherit",
              fontFamily: "monospace",
            }}
          >
            {shortenHex(address, 6)}
          </Link>
        </Tooltip>
      ) : (
        <Link
          href={url}
          style={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
        >
          {address}
        </Link>
      )}
    </>
  );
};
