import React, { useState } from "react";
import { Box, Typography, AccordionSummary } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { FaqAccordion, FaqAccordionDetails, QuestionIcon } from "./styled";

const FAQ = () => {
  const items = [
    {
      summary: "What is Cosmic Signature?",
      detail:
        "Cosmic Signature is an NFT project that combines generative art, an exciting bidding game, and social impact through charitable giving. It offers a unique, engaging, and socially impactful experience for the NFT community.",
    },
    {
      summary: "How does the bidding game work?",
      detail:
        "Each round begins with a 24-hour countdown and a low initial bid price of around 0.01 ETH. Every new bid increases the price by 1% and adds an hour to the clock. If you're the last person to bid when the timer runs out, you win the main prize.",
    },
    {
      summary: "What type of bids are available?",
      detail:
        "It is possible to bid with ETH or Cosmic Tokens (ERC20). You can also attach RandomWalk token to the bid and get 50% discount on bid price. Alternatively, you can bid using only ERC20 Cosmic Tokens through the Dutch auction.",
    },
    {
      summary: "What is the main prize?",
      detail:
        "The main prize is a unique Cosmic Signature NFT, 25% of the ETH pot, and any donated NFTs from other projects.",
    },
    {
      summary: "What are marketing rewards?",
      detail:
        "You can earn Cosmic Tokens (ERC20) by promoting Cosmic Game website in your Twitter account. Marketing rewards are paid on every bid placed during the round. Contact the Marketing Team for more info.",
    },
    {
      summary: "What are Cosmic Tokens and the Cosmic DAO?",
      detail:
        "Every bid also earns you Cosmic Tokens, which can be used to vote in the Cosmic DAO. The DAO helps decide which beneficiary receives 10% of the pot each round and may be used for other governance decisions in the future.",
    },
    {
      summary: "What is Dutch Auction bidding?",
      detail:
        "When you bid with ETH you will earn 100 Cosmic Tokens (ERC20). These tokens alone can be used to make another bid through the Dutch Auction. Dutch Auction is a special type of auction which lowers the bid price if nobody bids after certain amount of time, the more time passes, the lower the bid price gets. This feature allows you to save on bidding and continue playing the game.",
    },
    {
      summary: "How does the raffle work?",
      detail:
        "Each bid doubles as a raffle ticket. There are eight raffle winners each round — three winning a portion of the pot and five receiving a newly minted Cosmic Signature NFT.",
    },
    {
      summary: "How does staking work?",
      detail:
        'After winning Cosmic Signature Tokens in Raffles you can stake them and continue earning income. Staking pays 10% of CosmicGame contract balance on each round, and this amount is distributed equally between the owners of all staked tokens. To stake tokens go to "MY STAKING" page (available from your account balance menu).',
    },
    {
      summary: "What is the connection with RandomWalkNFT?",
      detail:
        "If you're a RandomWalkNFT holder, you can bid for free in Cosmic Signature, adding an extra layer of excitement and opportunity to the game.",
    },
    {
      summary: "How are the NFT images created?",
      detail:
        "The images for the Cosmic Signature NFTs are generated based on the three-body problem in physics. We simulate the movement of three planets in space and draw the trajectories of each planet, creating beautiful and unique patterns.",
    },
    {
      summary: "How can I get involved?",
      detail:
        "You can participate by bidding in a round or by donating an NFT from your project. We look forward to seeing you in the Cosmic Signature community!",
    },
    {
      summary: "How does the price increase with each bid?",
      detail:
        "Each bid increases the current price by 1%. This exponential growth adds an exciting strategic element to the bidding game.",
    },
    {
      summary: "Who receives the 10% contribution from the pot?",
      detail:
        "10% of the pot is allocated as a contribution to a beneficiary, decided by the Cosmic DAO. This could be a charitable organization, a research group, an open-source project, or even Ethereum client developers. This is our way of contributing to and supporting the wider community.",
    },
    {
      summary: "What happens to the remaining ETH in the pot after each round?",
      detail:
        "About half of the ETH pot is given to the winner of the round. The remaining half is carried over to the next round's pot, increasing the starting value for the next game.",
    },
    {
      summary: "Can I participate if I don't own any NFTs?",
      detail:
        "Yes, anyone can participate in the Cosmic Signature game by placing a bid. You do not need to own an NFT to bid, but owning a RandomWalkNFT allows you to place a bid for free.",
    },
    {
      summary: "How can other NFT projects donate their NFTs to the game?",
      detail:
        "Projects interested in donating their NFTs to the Cosmic Signature pot can get in touch with us through our website. Their NFTs will be displayed on the Cosmic Signature page for the duration of the round, providing visibility and marketing for their project.",
    },
    {
      summary: "How many Cosmic Signature NFTs are minted each round?",
      detail:
        "Six Cosmic Signature NFTs are minted each round—one for the main prize winner and one for each of the five NFT raffle winners.",
    },
    {
      summary:
        "How can I trade or sell my Cosmic Signature NFTs or Cosmic Tokens?",
      detail:
        "Cosmic Signature NFTs and Cosmic Tokens are compatible with any marketplace or exchange that supports ERC721 and ERC20 tokens, respectively. This includes popular platforms like OpenSea for NFTs and Uniswap for tokens.",
    },
    {
      summary: "Can I place multiple bids during a round?",
      detail:
        "Yes, you can place as many bids as you like during a round. Each bid increases your chances of winning and earns you more Cosmic Tokens.",
    },
    {
      summary:
        "Can I participate in the Cosmic DAO without bidding in the game?",
      detail:
        "Yes, you can purchase Cosmic Tokens on a supported exchange and use them to participate in the DAO. However, bidding in the game is the primary way to earn tokens.",
    },
    {
      summary: "Can I donate to the pot without participating in the bidding?",
      detail:
        "Yes, it is possible to donate directly to the pot. While this functionality is not directly accessible on the website, our smart contract includes a method that allows for ETH donations to the pot. Please reach out to our support team for guidance if you're interested in making a donation in this way.",
    },
    {
      summary: "How can I ensure that my bid has been successfully placed?",
      detail:
        "All successful bids will be confirmed on the blockchain. You can verify your transaction on the relevant Ethereum block explorer using your transaction hash.",
    },
    {
      summary: "What happens if two bids are placed at the same time?",
      detail:
        "Transactions on the Ethereum blockchain are processed in the order they are received. If two bids are received at the same time, the one that is confirmed by the blockchain first will be considered the valid bid.",
    },
    {
      summary: "How long does each round last?",
      detail:
        "Each round begins with a 24-hour countdown. However, because each bid adds an hour to the countdown, rounds may last longer than 24 hours.",
    },
    {
      summary: "How is the security of the Cosmic Signature game ensured?",
      detail:
        "Cosmic Signature is built on the Ethereum blockchain, which provides robust security for all transactions. The smart contracts for the game have been carefully designed to ensure fairness and transparency.",
    },
    {
      summary: "How can I stay updated on Cosmic Signature news and updates?",
      detail:
        "We recommend following our social media channels and joining our community chat for the latest news and updates.",
    },
    {
      summary: "Are there any fees involved in the Cosmic Signature game?",
      detail:
        "Aside from the cost of your bids, the only additional cost is the transaction fee on the Arbitrum network. This fee is for processing transactions and is not controlled by Cosmic Signature. Please be aware that network fees can vary.",
    },
    {
      summary: "How can I get help if I encounter problems or have questions?",
      detail:
        "Our community and support team are always ready to help. You can reach out to us via our community chat, social media channels, or support email.",
    },
    {
      summary: "What is Arbitrum and why is Cosmic Signature deployed on it?",
      detail:
        "Arbitrum is a layer 2 scaling solution for Ethereum that helps to speed up transactions and reduce fees. Cosmic Signature is deployed on Arbitrum to take advantage of these benefits, providing a better user experience with faster and cheaper transactions.",
    },
    {
      summary: "How do I get ETH on Arbitrum?",
      detail:
        "To get ETH on Arbitrum, you need to bridge it from the Ethereum mainnet. You can do this through the official Arbitrum bridge or other supported bridges. This involves sending your ETH to a special contract on Ethereum, which then mints an equivalent amount of ETH on Arbitrum. Please note that bridging assets requires gas fees on the Ethereum network and can take some time due to Ethereum block times.",
    },
    {
      summary: "Can I use my existing Ethereum wallet on Arbitrum?",
      detail:
        "Yes, you can use your existing Ethereum wallet on Arbitrum. The same private keys are valid on both networks. However, you will need to adjust your wallet's network settings to connect to Arbitrum. Instructions for this can vary by wallet, so please refer to your wallet's specific guidance on connecting to other networks.",
    },
    {
      summary: "How do I view my Cosmic Tokens and NFTs on Arbitrum?",
      detail:
        "You can view your Cosmic Tokens and NFTs directly on the Cosmic Signature website or in your wallet like any other ERC20 or ERC721 asset. However, to view them in your wallet, you will need to add the tokens' contract addresses manually. These addresses can be found on our website or by asking in our community chat. Always ensure that you're connected to the Arbitrum network in your wallet to view your assets correctly.",
    },
    {
      summary: "Can I trade my Cosmic Tokens and NFTs on Arbitrum?",
      detail:
        "Yes, Cosmic Tokens and NFTs can be traded on any marketplace or exchange that supports the Arbitrum network. This includes popular platforms like Uniswap for tokens and OpenSea for NFTs. Always make sure to verify that you are interacting with the correct contract addresses when trading.",
    },
    {
      summary:
        "What controls does the team have over the Cosmic Signature game?",
      detail:
        'Initially, the team behind Cosmic Signature will have the ability to adjust certain parameters of the game, such as the number of hours added after each bid or the percentage of the pot that goes to the raffle winners. This control is facilitated through the smart contract\'s "Ownable" feature, which assigns control to the address that deployed the contract.',
    },
    {
      summary: "Will the team always have control over the game's parameters?",
      detail:
        "No. Once the project is stable and functioning as intended, the developers will renounce their ownership of the contract, effectively giving up control over these parameters. This is done by calling the renounceOwnership() function in the contract.",
    },
    {
      summary: 'What does it mean to "renounce ownership"?',
      detail:
        'Renouncing ownership is a feature of the "Ownable" smart contract. When the developers call the renounceOwnership() function, they are permanently transferring control from their address. Once this function is called, the parameters of the game become immutable and cannot be changed.',
    },
    {
      summary: "Why would the team renounce ownership?",
      detail:
        "The team's goal is to create a fair and decentralized game. Renouncing ownership ensures that the game's rules can't be changed arbitrarily once it's up and running, adding a layer of trust and transparency for the players.",
    },
    {
      summary: "Does the time added per bid always stay the same?",
      detail:
        "No, the time added after each bid starts at 1 hour, but it will gradually increase over time. This increment is designed to be very slow, approximately 10% to 20% per year (exponential growth).",
    },
    {
      summary: "Why does the time added per bid increase over time?",
      detail:
        "The primary reason for this mechanism is to control the total number of Cosmic Signature NFTs that are minted. By slowing down the game, we limit the number of new NFTs being created, maintaining their exclusivity and potential value over time.",
    },
    {
      summary:
        "Does this mean that the number of Cosmic Signature NFTs is limited?",
      detail:
        "Yes, due to the gradual increase in time added per bid, the pace of new NFT creation slows down over time. This effectively limits the total number of Cosmic Signature NFTs, making them a limited resource in the long run.",
    },
    {
      summary: "How does the increase in time per bid affect the game?",
      detail:
        "As the time added per bid increases, the game slows down, which means that rounds will last longer. This change is designed to be gradual and slow, ensuring a smooth game experience while also limiting the total number of Cosmic Signature NFTs.",
    },
    {
      summary:
        "What impact does limiting the number of Cosmic Signature NFTs have?",
      detail:
        "By limiting the total number of Cosmic Signature NFTs, we aim to maintain their exclusivity and potential value. As the time added per bid increases and the creation of new NFTs slows down, each Cosmic Signature NFT becomes a more exclusive asset. This limited supply could potentially make each NFT more valuable over time.",
    },
    {
      summary: "Why was Cosmic Signature created?",
      detail:
        "Cosmic Signature was born out of a fascination with chaos theory and the unsolvable nature of the three-body problem. The idea of creating unique, dynamic art inspired by these principles felt intriguing and exciting. Our project is a blend of art, science, and blockchain technology.",
    },
    {
      summary: "Is there a game theory element in Cosmic Signature?",
      detail:
        "Absolutely! We're eager to see how participants will compete with each other within the parameters of the game. It's not just about winning; it's about strategy, timing, and risk assessment. The social dynamics and game theory aspects of Cosmic Signature are some of its most interesting features.",
    },
    {
      summary: "How does the Cosmic Signature team profit from this project?",
      detail:
        "We want to be transparent about this: our team doesn't pocket any money directly from the project. All the funds go into an immutable smart contract not controlled by us. Our interest lies in the Random Walk NFTs that we own, as we believe the success of Cosmic Signature will increase their value. That's our business interest, but our primary motivations are curiosity, creativity, and contribution to the blockchain community.",
    },
    {
      summary: "Why is Cosmic Signature deployed on Arbitrum and not Ethereum?",
      detail:
        "Our choice to deploy on Arbitrum was strategic. We believe that in the long run, most activity on Ethereum will migrate to Layer 2 solutions like Arbitrum. This is due to the significantly lower gas fees on Arbitrum while maintaining the same level of security as Ethereum Layer 1.",
    },
    {
      summary: "What makes Arbitrum as secure as Ethereum Layer 1?",
      detail:
        'Arbitrum is not a sidechain; it\'s a Rollup. This means that it bundles or "rolls up" multiple transfers into a single transaction, reducing the cost of transactions. But importantly, all its data and operations are still recorded on the Ethereum mainnet. This means that the security of Arbitrum is rooted in the Ethereum network, making it just as secure as Ethereum Layer 1.',
    },
    {
      summary: "What makes Cosmic Signature NFTs unique?",
      detail:
        "Cosmic Signature NFTs are unique in that they are on-chain and self-sustaining. Each NFT is created with a randomly generated seed that's stored in the smart contract. The image and video of the NFT is produced from this seed using an open-source Rust program. The seed determines the starting positions and the number of planets displayed in the NFT, making every NFT unique and special.",
    },
    {
      summary:
        "What is the significance of generating NFTs with a random seed?",
      detail:
        "The seed-based creation process of Cosmic Signature NFTs ensures their long-lasting existence. Unlike other NFT projects where images are stored on centralized servers that can go down, making the NFT images unavailable, the seed for each Cosmic Signature NFT is stored on the blockchain. With our open-source Rust program, anyone can take the seed and generate the NFT image and video at any time.",
    },
    {
      summary: "What if the team behind Cosmic Signature disappears?",
      detail:
        "Should anything happen to the team, the project is designed to be self-sustaining. Since the seeds for each NFT are stored on-chain, anyone can recreate the NFT images and videos using our open-source Rust program. This ensures the longevity and continued existence of your Cosmic Signature NFTs, irrespective of the project team's status.",
    },
    {
      summary: "Can I create a competing site with the Cosmic Signature NFTs?",
      detail:
        "Absolutely! The open-source nature of our project allows anyone to generate the NFT images and videos based on the seeds. If you wish, you could create a competing site using the same mechanism. This open ecosystem encourages creativity and fosters a sense of community around the project.",
    },
  ];

  const [expanded, setExpanded] = useState(null);

  const handleChange = (index) => (_event, isExpanded) => {
    setExpanded(isExpanded ? index : false);
  };

  return (
    <Box mt={4}>
      {items.map(({ summary, detail }, i) => (
        <FaqAccordion
          key={i}
          expanded={expanded === i}
          onChange={handleChange(i)}
        >
          <AccordionSummary
            expandIcon={
              expanded === i ? (
                <RemoveIcon color="primary" fontSize="small" />
              ) : (
                <AddIcon color="primary" fontSize="small" />
              )
            }
          >
            <Box display="flex" alignItems="center">
              <QuestionIcon src="images/question.svg" />
              <Typography
                variant="subtitle1"
                color={expanded === i ? "primary" : "info"}
              >
                {summary}
              </Typography>
            </Box>
          </AccordionSummary>
          <FaqAccordionDetails>
            <Typography
              variant="body1"
              align="left"
              color="rgba(255, 255, 255, 0.68)"
              dangerouslySetInnerHTML={{ __html: detail }}
            />
          </FaqAccordionDetails>
        </FaqAccordion>
      ))}
    </Box>
  );
};

export default FAQ;
