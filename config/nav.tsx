import { ReactNode } from "react";
import { Badge } from "@mui/material";

type NavItem = {
  title: string | ReactNode;
  route: string;
  children?: Array<NavItem>;
};

const getNAVs = (status, account) => {
  let NAVS: NavItem[] = [
    {
      title: "Play",
      route: "",
      children: [
        { title: "How-to-Play", route: "/how-to-play" },
        { title: "FAQ", route: "/faq" },
      ],
    },
    {
      title: "Resources",
      route: "",
      children: [
        { title: "Gallery", route: "/gallery" },
        { title: "Contracts", route: "/contracts" },
        { title: "Statistics", route: "/statistics" },
      ],
    },
    {
      title: "Rewards",
      route: "",
      children: [
        { title: "Prizes", route: "/prize" },
        { title: "Staking Rewards", route: "/staking" },
        { title: "Marketing Rewards", route: "/marketing" },
      ],
    },
    {
      title: "Support",
      route: "",
      children: [{ title: "Site-Map", route: "/site-map" }],
    },
  ];
  if (
    account &&
    (status?.ETHRaffleToClaim > 0 ||
      status?.NumDonatedNFTToClaim > 0 ||
      status?.UnclaimedStakingReward > 0)
  ) {
    NAVS.push({
      title: (
        <Badge badgeContent="$" color="error">
          Claim
        </Badge>
      ),
      route: "/my-winnings",
    });
  }
  return NAVS;
};

export default getNAVs;
