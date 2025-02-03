import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Typography,
} from "@mui/material";
import { MainWrapper } from "../components/styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GetServerSideProps } from "next";
import { getAssetsUrl } from "../utils";

const HowToPlay = () => {
  const [expanded, setExpanded] = useState(null);

  const handleChange = (index) => (_event, isExpanded) => {
    setExpanded(isExpanded ? index : false);
  };
  return (
    <MainWrapper>
      <Typography
        variant="h4"
        color="primary"
        gutterBottom
        textAlign="center"
        mb={4}
      >
        How To Play Guide
      </Typography>
      <Typography mb={2}>
        Cosmic Signature is a strategy bidding game. In an exhilarating contest,
        players will bid against other players and against time to win exciting
        $ETH prizes and Cosmic Signature NFTs.
      </Typography>
      <Typography mb={4}>
        Here are the exact steps to play the Cosmic Signature game.
      </Typography>
      <Box mt={8}>
        <Typography variant="h5" mb={4}>
          Step 1: Connect Your Wallet.
        </Typography>
        <Typography mb={2}>
          When you land on the Cosmic Signature website (
          <Link href="www.cosmicsignature.com" target="_blank">
            www.cosmicsignature.com
          </Link>
          ), you will be automatically prompted to connect your crypto wallet to
          the website.
        </Typography>
        <Typography mb={4}>
          If you are not prompted, click the [Connect Wallet] button at the top
          of your homepage screen.
        </Typography>
        <Box mb={4}>
          <img src="/images/screenshot1.png" width="100%" />
        </Box>
        <Typography mb={2}>
          Since the game is deployed on the Arbitrum blockchain, you will have
          to connect with a wallet that supports the Arbitrum blockchain, like
          Metamask Wallet.
        </Typography>
        <Typography mb={2}>
          Once you have connected your wallet, you will be asked to swap your
          network to Arbitrum. Switch your network, review the contract, and
          then approve permissions.
        </Typography>
        <Typography mb={4}>
          Once approved, you will see your wallet address displayed at the top
          of the Cosmic Signature website.
        </Typography>
      </Box>
      <Box mt={8}>
        <Typography variant="h5" mb={4}>
          Step#2: Check The Bid Price!
        </Typography>
        <Typography mb={2}>
          Before you place a bid, you want to start by checking the round
          details.
        </Typography>
        <Typography mb={2}>
          Review these 4 fields before placing a bid:
        </Typography>
        <Typography mb={4}>
          1. <b>[Round Timer]:</b> At the top left of the website, you will see
          a countdown timer ticking down. At the start of each round, this timer
          is reset to 24 hours. Every time someone places a bid, the timer adds
          1 hour. The last person to bid when the timer runs out wins the game.
        </Typography>
        <Box mb={4}>
          <img src="/images/screenshot2.png" width="100%" />
        </Box>
        <Typography mb={2}>
          2. <b>[Bid Price]:</b> Before you place a bid, you want to check the
          bid price. You can make a bid using $ETH or Cosmic Tokens ($CST).
        </Typography>
        <Typography mb={4}>
          If you hold an NFT from our sister collection Random Walk NFT, you can
          get a 50% discount on your $ETH bid price. However, keep in mind that
          you can avail the 50% discount once, so be wise about using it.
        </Typography>
        <Box mb={4}>
          <img src="/images/screenshot3.png" width="100%" />
        </Box>
        <Typography mb={4}>
          3. <b>[Main Prize Reward]:</b> The Main Prize Reward displays the
          amount you will get if you win the round.
        </Typography>
        <Box mb={4}>
          <img src="/images/screenshot4.png" width="100%" />
        </Box>
        <Typography mb={2}>
          4. <b>[Last Bidder Address]:</b> The wallet address of the last person
          that made a bid.
        </Typography>
        <Typography mb={2}>
          Make sure you hold the displayed bid price in your crypto wallet (in
          $ETH or $CST) and a few extra cents to pay for gas on the Arbitrum
          blockchain.
        </Typography>
      </Box>
      <Box mt={8}>
        <Typography variant="h5" mb={4}>
          Step#3: Make A Bid!
        </Typography>
        <Typography mb={2}>
          Once you have successfully connected your wallet, choose your method
          of bidding from $ETH or $CST.
        </Typography>
        <Typography mb={2}>
          If you wish to avail your 50% Random Walk NFT discount, click [Random
          Walk].
        </Typography>
        <Typography mb={2}>
          When you click your desired currency, you will be displayed the bid
          price button.
        </Typography>
        <Typography mb={2}>
          Review this price and when you want to make a bid, click the [Bid Now]
          button.
        </Typography>
        <Typography mb={2}>
          As soon as you click this button, you will be prompted to your wallet
          and asked to confirm the transaction.
        </Typography>
        <Typography mb={2}>
          Make sure to review your transaction before signing it. Also check the
          gas fees, and then approve the transaction.
        </Typography>
        <Typography mb={2}>
          When you make a bid, the countdown timer will increase by 1 hour, and
          the next bid price will increase by 1%. When the timer reaches zero,
          the last player to make the bid will win the round.
        </Typography>
      </Box>
      <Box mt={8}>
        <Accordion expanded={expanded === 0} onChange={handleChange(0)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">How To Claim My Rewards?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>For each bid you make, you get:</Typography>
            <ul>
              <li>
                <Typography>100 Cosmic Tokens as a reward</Typography>
              </li>
              <li>
                <Typography>1 raffle ticket</Typography>
              </li>
              <li>
                <Typography>
                  A chance to win the Cosmic Signature NFT
                </Typography>
              </li>
            </ul>
            <Typography mb={2}>
              When you win, you get 25% of the prize pool. You will be required
              to withdraw this prize money from a special contract.
            </Typography>
            <Typography mb={2}>
              At the end of each round, 3 raffle tickets will be chosen at
              random by our smart contract to win 12% of the pot. Also, 5
              additional winners and 4 Random Walk NFT stakers will be chosen
              who will receive a Cosmic Signature NFT.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box mt={8}>
        <Accordion
          expanded={expanded === 1}
          onChange={handleChange(1)}
          sx={{ mt: 8 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Things To Keep In Mind:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ul>
              <li>
                <Typography>
                  You can check the full bid history for each round under{" "}
                  <b>[Current Round Bid History]</b> at the end of the homepage.
                </Typography>
              </li>
              <li>
                <Typography>
                  You earn 100 CST every time you place a bid.
                </Typography>
              </li>
              <li>
                <Typography>
                  Every time you bid, you are also buying a raffle ticket. The
                  more times you bid, the higher your chances of winning the
                  raffle.
                </Typography>
              </li>
              <li>
                <Typography>
                  At the end of each round, the bid price resets to
                  approximately 100 times lower than the winning bid price of
                  the previous round.
                </Typography>
              </li>
              <li>
                <Typography>
                  TIP: We have a secure and audited smart contract, but if you
                  are unsure it’s always safe to use a burner wallet when
                  bidding.
                </Typography>
              </li>
            </ul>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Typography mt={8}>
        If you have any questions or confusion, feel free to ask them in the{" "}
        <Link
          href="https://discord.com/channels/1258032742084509779/1258691600951935056"
          target="_blank"
        >
          #cosmic-gameroom
        </Link>{" "}
        channel inside our Discord, or{" "}
        <Link href="https://x.com/CosmicSignatureNFT" target="_blank">
          write us a message on Twitter/X
        </Link>
        .
      </Typography>
      <Typography fontStyle="italic" mt={2}>
        Happy bidding!
      </Typography>
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "How To Play Guide | Cosmic Signature";
  const description =
    "Learn how to play Cosmic Signature with our comprehensive guide. Discover game rules, strategies, and tips to enhance your gameplay experience. Start mastering the cosmic adventure today!";
  const imageUrl = getAssetsUrl("cosmicsignature/logo.png");

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

export default HowToPlay;
