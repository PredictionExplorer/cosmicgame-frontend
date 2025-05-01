import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";
import { AdminEventRow, AdminEventsTable } from "./system-event/[start]/[end]";

function ChangedParameters() {
  const { account } = useActiveWeb3React();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AdminEventRow[]>([]);

  const getSysEventsForLastRound = async () => {
    try {
      setLoading(true);
      const mode_list = await api.get_system_modelist();
      const start = mode_list[0].EvtLogId;
      const end = 9999999999;
      const system_events = await api.get_system_events(start, end);
      setEvents(system_events);
      setLoading(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSysEventsForLastRound();
  }, []);

  // If user is not connected
  if (!account) {
    return (
      <MainWrapper>
        <Typography variant="h4" color="primary" textAlign="center" mb={4}>
          Changed Parameters
        </Typography>
        <Typography variant="subtitle1">
          Please login to Metamask to see your winnings.
        </Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Changed Parameters
      </Typography>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <AdminEventsTable list={events} />
      )}
    </MainWrapper>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Changed Parameters | Cosmic Signature";
  const description = "Changed Parameters";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default ChangedParameters;
