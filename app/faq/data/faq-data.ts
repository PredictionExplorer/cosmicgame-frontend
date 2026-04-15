import { Rocket, Trophy, Gamepad2, Gem, Layers, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  /** Legacy hash anchors preserved for backward compatibility */
  hashAnchor?: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: FAQItem[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'The basics of Cosmic Signature and how to jump in',
    icon: Rocket,
    items: [
      {
        id: 'what-is-cosmic-signature',
        question: 'What is Cosmic Signature?',
        answer:
          'Cosmic Signature is an NFT project that combines generative art, an exciting bidding game, and social impact through charitable giving. It offers a unique, engaging, and socially impactful experience for the NFT community.',
      },
      {
        id: 'how-does-the-bidding-game-work',
        question: 'How does the bidding game work?',
        answer:
          'Each round begins with a 24-hour countdown and a low initial bid price of around 0.01 ETH. Every new bid increases the price by 1% and adds an hour to the clock. If you are the last person to place a bid when the timer runs out, you win the main prize.',
      },
      {
        id: 'what-type-of-bids-are-available',
        question: 'What type of bids are available?',
        answer:
          'It is possible to bid with ETH or Cosmic Signature Tokens (ERC-20). You can also attach a RandomWalk token to the bid and receive a 50% discount on the bid price. The bid price in Cosmic Signature Tokens continuously decreases according to the rules of a Dutch auction.',
      },
      {
        id: 'can-i-participate-without-nfts',
        question: "Can I participate if I don't own any NFTs?",
        answer:
          'Yes, anyone can participate in the Cosmic Signature game by placing a bid. You do not need to own an NFT to bid, but owning a RandomWalkNFT gives you a 50% discount on the bid price.',
      },
      {
        id: 'how-can-i-get-involved',
        question: 'How can I get involved?',
        answer:
          'You can participate by bidding in a round or by donating an NFT from your project. We look forward to seeing you in the Cosmic Signature community!',
      },
      {
        id: 'how-long-does-each-round-last',
        question: 'How long does each round last?',
        answer:
          'Each round begins with a 24-hour countdown. However, because each bid adds an hour to the countdown, rounds may last longer than 24 hours.',
      },
      {
        id: 'can-i-place-multiple-bids',
        question: 'Can I place multiple bids during a round?',
        answer:
          'Yes, you can place as many bids as you like during a round. Each bid increases your chances of winning and earns you more Cosmic Signature Tokens.',
      },
    ],
  },
  {
    id: 'prizes-and-rewards',
    title: 'Prizes & Rewards',
    description: 'What you can win and how rewards are distributed',
    icon: Trophy,
    items: [
      {
        id: 'what-is-the-main-prize',
        question: 'What is the main prize?',
        answer:
          'The main prize includes a unique COSMIC NFT, 25% of the ETH pot, and any donated tokens (ERC-20/ERC-721) from other projects.',
        hashAnchor: 'main-prize',
      },
      {
        id: 'what-rewards-per-bid',
        question: 'What rewards do I get for each bid?',
        answer:
          'Every bid earns you three things: 100 CST (Cosmic Signature Tokens), 1 raffle ticket for end-of-round drawings, and a chance to win a COSMIC NFT.',
      },
      {
        id: 'how-does-the-raffle-work',
        question: 'How does the raffle work?',
        answer:
          'Each bid also serves as a raffle ticket. At the end of each round, the smart contract randomly selects 4 raffle ticket holders who share 6% of the prize pool. Additionally, 5 winners receive a COSMIC NFT, and 4 Random Walk NFT stakers also receive an NFT. The more bids you make, the higher your chances.',
      },
      {
        id: 'how-do-i-claim-my-prize',
        question: 'How do I claim my prize if I win?',
        answer:
          "The main prize winner receives 25% of the prize pool. You'll need to withdraw your winnings from the prize contract. Navigate to your profile or the prize page to initiate the withdrawal after the round ends.",
      },
      {
        id: 'how-does-staking-work',
        question: 'How does staking work?',
        answer:
          'After winning Cosmic Signature Tokens in raffles, you can stake them and continue earning income. Staking pays 19% of the CosmicGame contract balance each round, and this amount is distributed equally among the owners of all staked tokens. To stake tokens, go to the "MY STAKING" page (available from your account balance menu).',
      },
      {
        id: 'what-are-marketing-rewards',
        question: 'What are marketing rewards?',
        answer:
          'You can earn Cosmic Signature Tokens (ERC-20) by promoting the Cosmic Game website on your Twitter account. Marketing rewards are paid on every bid placed during the round. Contact the marketing team for more info.',
      },
      {
        id: 'how-many-nfts-minted',
        question: 'How many COSMIC NFTs are minted each round?',
        answer:
          '12 COSMIC NFTs are minted each round — one for the main prize winner and one for each of the eleven NFT raffle winners.',
      },
      {
        id: 'what-happens-to-remaining-eth',
        question: 'What happens to the remaining ETH in the pot after each round?',
        answer:
          "About half of the ETH pot is given to the winner of the round. The remaining half is carried over to the next round's pot, increasing the starting value for the next game.",
      },
      {
        id: 'who-receives-10-percent',
        question: 'Who receives the 10% contribution from the pot?',
        answer:
          '10% of the pot is allocated as a contribution to a beneficiary, decided by the Cosmic DAO. This could be a charitable organization, a research group, an open-source project, or even Ethereum client developers. This is our way of contributing to and supporting the wider community.',
      },
    ],
  },
  {
    id: 'game-mechanics',
    title: 'Game Mechanics',
    description: 'Deep dive into bidding strategy and game rules',
    icon: Gamepad2,
    items: [
      {
        id: 'how-does-price-increase',
        question: 'How does the price increase with each bid?',
        answer:
          'Each bid increases the current price by 1%. This exponential growth adds an exciting strategic element to the bidding game. Bid early for lower prices and more raffle tickets, or bid later when the stakes and potential reward are higher. At the start of a new round, the price resets to approximately 100x lower than the final winning bid.',
      },
      {
        id: 'what-is-dutch-auction',
        question: 'What is Dutch Auction bidding?',
        answer:
          'When you bid with ETH, you will earn 100 Cosmic Signature Tokens (ERC-20). These tokens can be used to make another bid through the Dutch auction. A Dutch auction is a type of auction that lowers the bid price if nobody bids after a certain amount of time; the more time passes, the lower the bid price gets. This feature allows you to save on bidding and continue playing the game.',
      },
      {
        id: 'what-is-endurance-champion',
        question: 'What is an Endurance Champion?',
        answer:
          'The bidder who remained the last bidder for the longest consecutive period of time (i.e. the longest gap before someone else bid).',
        hashAnchor: 'endurance-champion',
      },
      {
        id: 'what-is-chrono-warrior',
        question: 'What is a Chrono Warrior?',
        answer:
          'The bidder who held the Endurance Champion title for the longest consecutive period of time. Similar to how the Endurance Champion is the longest-reigning last bidder, the Chrono Warrior is the longest-reigning Endurance Champion.',
        hashAnchor: 'chrono-warrior',
      },
      {
        id: 'does-time-per-bid-stay-same',
        question: 'Does the time added per bid always stay the same?',
        answer:
          'No. The time added after each bid starts at 1 hour, but it will gradually increase over time. This increment is designed to be very slow — approximately 10% to 20% per year (exponential growth).',
      },
      {
        id: 'why-time-per-bid-increases',
        question: 'Why does the time added per bid increase over time?',
        answer:
          'The primary reason for this mechanism is to control the total number of COSMIC NFTs minted. By slowing down the game, we limit the number of new NFTs created, maintaining their exclusivity and potential value over time.',
      },
      {
        id: 'how-time-increase-affects-game',
        question: 'How does the increase in time per bid affect the game?',
        answer:
          'As the time added per bid increases, the game slows down, meaning that rounds will last longer. This change is designed to be gradual, ensuring a smooth gameplay experience while also limiting the total number of COSMIC NFTs.',
      },
      {
        id: 'what-if-two-bids-same-time',
        question: 'What happens if two bids are placed at the same time?',
        answer:
          'Transactions on the Ethereum blockchain are processed in the order they are received. If two bids are received at the same time, the one that is confirmed by the blockchain first will be considered the valid bid.',
      },
      {
        id: 'is-there-game-theory',
        question: 'Is there a game theory element in Cosmic Signature?',
        answer:
          'Absolutely! We are eager to see how participants will compete with each other within the parameters of the game. It is not just about winning; it is about strategy, timing, and risk assessment. The social dynamics and game theory aspects of Cosmic Signature are among its most interesting features.',
      },
    ],
  },
  {
    id: 'tokens-and-nfts',
    title: 'Tokens & NFTs',
    description: 'Everything about CST, NFT art, and digital assets',
    icon: Gem,
    items: [
      {
        id: 'what-are-cst-and-dao',
        question: 'What are Cosmic Signature Tokens and the Cosmic DAO?',
        answer:
          'Every bid also earns you Cosmic Signature Tokens, which can be used to vote in the Cosmic DAO. The DAO helps decide which beneficiary receives 10% of the pot each round and may be used for other governance decisions in the future.',
      },
      {
        id: 'what-can-i-do-with-cst',
        question: 'What can I do with CST tokens?',
        answer:
          'CST (Cosmic Signature Tokens) can be used as an alternative currency to place bids instead of ETH. You earn 100 CST every time you bid, so active players naturally accumulate CST to use in future rounds. They can also be used to vote in the Cosmic DAO.',
      },
      {
        id: 'what-makes-nfts-unique',
        question: 'What makes COSMIC NFTs unique?',
        answer:
          'COSMIC NFTs are unique in that they are on-chain and self-sustaining. Each NFT is created with a randomly generated seed that is stored in the smart contract. The image and video of the NFT are produced from this seed using an open-source Rust program. The seed determines the starting positions and the number of planets displayed in the NFT, making every NFT unique and special.',
      },
      {
        id: 'how-are-nft-images-created',
        question: 'How are the NFT images created?',
        answer:
          'The images for the COSMIC NFTs are generated based on the three-body problem in physics. We simulate the movement of three planets in space and draw the trajectories of each planet, creating beautiful and unique patterns.',
      },
      {
        id: 'significance-of-random-seed',
        question: 'What is the significance of generating NFTs with a random seed?',
        answer:
          'The seed-based creation process of COSMIC NFTs ensures their long-term existence. Unlike other NFT projects, where images are stored on centralized servers that can go down — making the NFT images unavailable — the seed for each COSMIC NFT is stored on the blockchain. Using our open-source Rust program, anyone can take the seed and generate the NFT image and video at any time.',
      },
      {
        id: 'is-nft-supply-limited',
        question: 'Does this mean that the number of COSMIC NFTs is limited?',
        answer:
          'Yes, due to the gradual increase in time added per bid, the pace of new NFT creation slows over time. This effectively limits the total number of COSMIC NFTs, making them a limited resource in the long run.',
      },
      {
        id: 'impact-of-limiting-nfts',
        question: 'What impact does limiting the number of COSMIC NFTs have?',
        answer:
          'By limiting the total number of COSMIC NFTs, we aim to maintain their exclusivity and potential value. As the time added per bid increases and the creation of new NFTs slows, each COSMIC NFT becomes a more exclusive asset. This limited supply could make each NFT more valuable over time.',
      },
      {
        id: 'connection-with-randomwalknft',
        question: 'What is the connection with RandomWalkNFT?',
        answer:
          'If you are a RandomWalkNFT holder, you can bid with a 50% discount in Cosmic Game. This discount can only be used once per wallet, so save it for a strategically valuable moment when the bid price is high.',
      },
      {
        id: 'how-to-trade-nfts-tokens',
        question: 'How can I trade or sell my COSMIC NFTs or Cosmic Signature Tokens?',
        answer:
          'COSMIC NFTs and Cosmic Signature Tokens are compatible with any marketplace or exchange that supports ERC-721 and ERC-20 tokens, respectively. This includes popular platforms like OpenSea for NFTs and Uniswap for tokens.',
      },
      {
        id: 'participate-dao-without-bidding',
        question: 'Can I participate in the Cosmic DAO without bidding in the game?',
        answer:
          'Yes, you can purchase Cosmic Signature Tokens on a supported exchange and use them to participate in the DAO. However, bidding in the game is the primary way to earn tokens.',
      },
      {
        id: 'donate-nfts-to-game',
        question: 'How can other NFT projects donate their NFTs to the game?',
        answer:
          'Projects interested in donating their tokens (ERC-721 or ERC-20) to the Cosmic Signature pot can use the "Advanced Options" in the bid pane. Simply provide the contract address and token ID/amount, and click the Bid button. Donated tokens will be transferred to the CosmicGame contract and awarded to the main prize winner after the round ends.',
      },
    ],
  },
  {
    id: 'arbitrum-and-technical',
    title: 'Arbitrum & Technical',
    description: 'Network setup, wallets, and technical details',
    icon: Layers,
    items: [
      {
        id: 'what-is-arbitrum',
        question: 'What is Arbitrum and why is Cosmic Signature deployed on it?',
        answer:
          'Arbitrum is a layer 2 scaling solution for Ethereum that helps to speed up transactions and reduce fees. Cosmic Signature is deployed on Arbitrum to take advantage of these benefits, providing a better user experience with faster and cheaper transactions.',
      },
      {
        id: 'why-arbitrum-not-ethereum',
        question: 'Why is Cosmic Signature deployed on Arbitrum and not Ethereum?',
        answer:
          "Our choice to deploy on Arbitrum was strategic. We believe that, in the long run, most activity on Ethereum will migrate to Layer 2 solutions like Arbitrum. This is due to Arbitrum's significantly lower gas fees while maintaining the same level of security as Ethereum Layer 1.",
      },
      {
        id: 'arbitrum-security',
        question: 'What makes Arbitrum as secure as Ethereum Layer 1?',
        answer:
          'Arbitrum is not a sidechain; it is a rollup. This means it bundles, or "rolls up," multiple transfers into a single transaction, reducing transaction costs. Importantly, all its data and operations are still recorded on the Ethereum mainnet. This ensures that Arbitrum\'s security is rooted in the Ethereum network, making it just as secure as Ethereum Layer 1.',
      },
      {
        id: 'how-to-get-eth-on-arbitrum',
        question: 'How do I get ETH on Arbitrum?',
        answer:
          'To get ETH on Arbitrum, you need to bridge it from the Ethereum mainnet. You can do this through the official Arbitrum bridge or other supported bridges. This involves sending your ETH to a special contract on Ethereum, which then mints an equivalent amount of ETH on Arbitrum. Please note that bridging assets requires gas fees on the Ethereum network.',
      },
      {
        id: 'existing-wallet-on-arbitrum',
        question: 'Can I use my existing Ethereum wallet on Arbitrum?',
        answer:
          "Yes, you can use your existing Ethereum wallet on Arbitrum. The same private keys are valid on both networks. However, you will need to adjust your wallet's network settings to connect to Arbitrum.",
      },
      {
        id: 'view-tokens-on-arbitrum',
        question: 'How do I view my Cosmic Signature Tokens and NFTs on Arbitrum?',
        answer:
          "You can view your Cosmic Signature Tokens and NFTs directly on the Cosmic Signature website or in your wallet like any other ERC-20 or ERC-721 asset. To view them in your wallet, you may need to add the tokens' contract addresses manually. These addresses can be found on our website or by asking in our community chat.",
      },
      {
        id: 'trade-on-arbitrum',
        question: 'Can I trade my Cosmic Signature Tokens and NFTs on Arbitrum?',
        answer:
          'Yes, Cosmic Signature Tokens and NFTs can be traded on any marketplace or exchange that supports the Arbitrum network. This includes popular platforms like Uniswap for tokens and OpenSea for NFTs. Always verify that you are interacting with the correct contract addresses when trading.',
      },
      {
        id: 'verify-bid-success',
        question: 'How can I ensure that my bid has been successfully placed?',
        answer:
          'All successful bids will be confirmed on the blockchain. You can verify your transaction on the relevant Ethereum block explorer using your transaction hash.',
      },
      {
        id: 'game-security',
        question: 'How is the security of the Cosmic Signature game ensured?',
        answer:
          'Cosmic Signature is built on the Ethereum blockchain, which provides robust security for all transactions. The smart contracts for the game have been carefully designed to ensure fairness and transparency.',
      },
      {
        id: 'fees-involved',
        question: 'Are there any fees involved in the Cosmic Signature game?',
        answer:
          'Aside from the cost of your bids, the only additional cost is the transaction fee on the Arbitrum network. This fee is for processing transactions and is not controlled by Cosmic Signature. Please be aware that network fees can vary.',
      },
    ],
  },
  {
    id: 'trust-and-governance',
    title: 'Trust & Governance',
    description: 'Transparency, team control, and the open-source vision',
    icon: ShieldCheck,
    items: [
      {
        id: 'team-controls',
        question: 'What controls does the team have over the Cosmic Signature game?',
        answer:
          'Initially, the team behind Cosmic Signature will have the ability to adjust certain parameters of the game, such as the number of hours added after each bid or the percentage of the pot that goes to the raffle winners. This control is applied only during the round activation window and is facilitated through the smart contract\'s "Ownable" feature. Once the game starts (when the first bid is made), nobody — including the Owner — can change the game conditions until the main prize is claimed.',
      },
      {
        id: 'will-team-always-have-control',
        question: "Will the team always have control over the game's parameters?",
        answer:
          'No. Once the project is stable and functioning as intended, the developers will renounce their ownership of the contract, effectively giving up control over these parameters. This is done by calling the renounceOwnership() function in the contract.',
      },
      {
        id: 'what-is-renounce-ownership',
        question: 'What does it mean to "renounce ownership"?',
        answer:
          'Renouncing ownership is a feature of the "Ownable" smart contract. When the developers call the renounceOwnership() function, they permanently transfer control from their address. Once this function is called, the parameters of the game become immutable and cannot be changed.',
      },
      {
        id: 'why-renounce-ownership',
        question: 'Why would the team renounce ownership?',
        answer:
          "The team's goal is to create a fair and decentralized game. Renouncing ownership ensures that the game's rules cannot be changed arbitrarily once it is up and running, adding a layer of trust and transparency for players.",
      },
      {
        id: 'how-team-profits',
        question: 'How does the Cosmic Signature team profit from this project?',
        answer:
          "The team does not pocket any money directly from the project. All funds go into an immutable smart contract that is not controlled by the team. The team's interest lies in the Random Walk NFTs they own, as the success of Cosmic Signature could increase their value. The primary motivations are curiosity, creativity, and contributing to the blockchain community.",
      },
      {
        id: 'why-was-cs-created',
        question: 'Why was Cosmic Signature created?',
        answer:
          'Cosmic Signature was born out of a fascination with chaos theory and the unsolvable nature of the three-body problem. The idea of creating unique, dynamic art inspired by these principles was both intriguing and exciting. The project blends art, science, and blockchain technology.',
      },
      {
        id: 'what-if-team-disappears',
        question: 'What if the team behind Cosmic Signature disappears?',
        answer:
          "Should anything happen to the team, the project is designed to be self-sustaining. Since the seeds for each NFT are stored on-chain, anyone can recreate the NFT images and videos using the open-source Rust program. This ensures the longevity and continued existence of your COSMIC NFTs, regardless of the project team's status.",
      },
      {
        id: 'can-create-competing-site',
        question: 'Can I create a competing site with the COSMIC NFTs?',
        answer:
          'Absolutely! The open-source nature of the project allows anyone to generate NFT images and videos based on the seeds. You could even create a competing site using the same mechanism. This open ecosystem encourages creativity and fosters a sense of community around the project.',
      },
      {
        id: 'donate-to-pot',
        question: 'Can I donate to the pot without participating in the bidding?',
        answer:
          'Yes, it is possible to donate directly to the pot. The smart contract includes a method that allows ETH donations. You can also make a donation with a message, which may be displayed on the front page if you are among the top five donors for the round. Reach out to the support team for guidance.',
      },
      {
        id: 'get-help',
        question: 'How can I get help if I encounter problems or have questions?',
        answer:
          'The community and support team are always ready to help. You can reach out via the Discord community chat, Twitter, or support email.',
      },
      {
        id: 'stay-updated',
        question: 'How can I stay updated on Cosmic Signature news and updates?',
        answer:
          'Follow the official social media channels and join the Discord community for the latest news, announcements, and updates.',
      },
    ],
  },
];

export const popularQuestionIds = [
  'what-is-cosmic-signature',
  'what-is-the-main-prize',
  'how-does-the-raffle-work',
  'how-does-staking-work',
];

export function getAllItems(): FAQItem[] {
  return faqCategories.flatMap((cat) => cat.items);
}

export function getTotalQuestionCount(): number {
  return faqCategories.reduce((sum, cat) => sum + cat.items.length, 0);
}

export function findItemById(id: string): { item: FAQItem; category: FAQCategory } | undefined {
  for (const category of faqCategories) {
    const item = category.items.find((q) => q.id === id);
    if (item) return { item, category };
  }
  return undefined;
}

export function findItemByHash(hash: string): { item: FAQItem; category: FAQCategory } | undefined {
  const anchor = hash.replace('#', '');
  for (const category of faqCategories) {
    const item = category.items.find((q) => q.hashAnchor === anchor || q.id === anchor);
    if (item) return { item, category };
  }
  return undefined;
}
