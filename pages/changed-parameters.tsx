import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import { useActiveWeb3React } from "../hooks/web3";
import api from "../services/api";
import { GetServerSideProps } from "next";
import { logoImgUrl } from "../utils";
import { AdminEventRow, AdminEventsTable } from "./system-event/[start]/[end]";

function ChangedParameters() {
  // Retrieve connected wallet account
  const { account } = useActiveWeb3React();

  // Local state for loading indicator and event data
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AdminEventRow[]>([]);

  // Fetches the most recent system events using API
  const fetchLatestSystemEvents = async () => {
    try {
      setLoading(true); // Start loading

      // Get the list of modes, extract the start ID from the first item
      const modeList = await api.get_system_modelist();
      const startId = modeList[0].EvtLogId;
      const endId = 9999999999; // A hardcoded high end range

      // Fetch events from API within the given range
      const systemEvents = await api.get_system_events(startId, endId);

      // Store results in state
      setEvents(systemEvents);
    } catch (err) {
      console.error("Error fetching system events:", err);
    } finally {
      setLoading(false); // Stop loading in all cases
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchLatestSystemEvents();
  }, []);

  // Render if no wallet is connected
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

  // Render main content
  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Changed Parameters
      </Typography>

      {/* Show loading message or data table */}
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <AdminEventsTable list={events} />
      )}
    </MainWrapper>
  );
}

// Metadata for SEO and Open Graph
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
