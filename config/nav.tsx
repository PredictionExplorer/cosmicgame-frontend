import { ReactNode } from "react";
import { Badge } from "@mui/material";

type NavItem = {
  title: string | ReactNode;
  route: string;
  children?: Array<NavItem>;
};

const getNAVs = (status, account) => {
  let NAVS: NavItem[] = [
    { title: "Gallery", route: "/gallery" },
    { title: "Contracts", route: "/contracts" },
    {
      title: "Prizes & Rewards",
      route: "",
      children: [
        { title: "Prizes", route: "/prize" },
        { title: "Staking", route: "/staking" },
        { title: "Marketing", route: "/marketing" },
      ],
    },
    { title: "Statistics", route: "/statistics" },
    { title: "FAQ", route: "/faq" },
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
