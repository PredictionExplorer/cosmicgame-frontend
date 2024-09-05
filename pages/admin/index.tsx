import { Box, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import { useEffect, useState } from "react";
import api from "../../services/api";
import BanBidTable from "../../components/BanBidTable";

const Admin = () => {
  const [bidList, setBidList] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let bidList = await api.get_bid_list();
      bidList = bidList.filter((x) => x.Message !== "");
      setBidList(bidList);
    };
    fetchData();
  }, []);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" align="center" mb={4}>
        Administrative methods
      </Typography>
      <Box>
        <Typography variant="h5" mb={2}>
          Bid List
        </Typography>
        {bidList === null ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <BanBidTable biddingHistory={bidList} />
        )}
      </Box>
    </MainWrapper>
  );
};

export default Admin;
