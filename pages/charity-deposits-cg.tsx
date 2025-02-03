import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { CharityDepositTable } from "../components/CharityDepositTable";
import { GetServerSideProps } from "next";

const CharityCGDeposits = () => {
  const [loading, setLoading] = useState(true);
  const [CGDeposits, setCGDeposits] = useState([]);

  useEffect(() => {
    const fetchCharityDeposits = async () => {
      try {
        setLoading(true);
        const cg_deposits = await api.get_charity_cg_deposits();
        setCGDeposits(cg_deposits);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    fetchCharityDeposits();
  }, []);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Cosmic Game Charity Deposits
      </Typography>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <CharityDepositTable list={CGDeposits} />
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Cosmic Game Charity Deposits | Cosmic Signature";
  const description = "Cosmic Game Charity Deposits";
  const imageUrl = "http://69.10.55.2/images/cosmicsignature/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default CharityCGDeposits;
