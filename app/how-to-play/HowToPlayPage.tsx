'use client';

import Image from 'next/image';

import { MainWrapper } from '@/components/styled';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const HowToPlayPage = () => {
  return (
    <MainWrapper>
      <h2 className="text-2xl font-bold text-primary text-center mb-8">How To Play Guide</h2>

      <p className="mb-4">
        Cosmic Signature is a strategy bidding game. In an exhilarating contest, players will bid
        against other players and against time to win exciting $ETH prizes and Cosmic Signature
        NFTs.
      </p>
      <p className="mb-8">Here are the exact steps to play the Cosmic Signature game.</p>

      {/* Step 1 */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-8">Step 1: Connect Your Wallet.</h3>
        <p className="mb-4">
          When you land on the Cosmic Signature website (
          <a
            href="https://www.cosmicsignature.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            www.cosmicsignature.com
          </a>
          ), you will be automatically prompted to connect your crypto wallet to the website.
        </p>
        <p className="mb-8">
          If you are not prompted, click the [Connect Wallet] button at the top of your homepage
          screen.
        </p>

        <div className="mb-8">
          <Image
            src="/images/screenshot1.png"
            width={1200}
            height={675}
            alt="Connecting wallet screenshot"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <p className="mb-4">
          Since the game is deployed on the Arbitrum blockchain, you will have to connect with a
          wallet that supports the Arbitrum blockchain, like Metamask Wallet.
        </p>
        <p className="mb-4">
          Once you have connected your wallet, you will be asked to swap your network to Arbitrum.
          Switch your network, review the contract, and then approve permissions.
        </p>
        <p className="mb-8">
          Once approved, you will see your wallet address displayed at the top of the Cosmic
          Signature website.
        </p>
      </div>

      {/* Step 2 */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-8">Step#2: Check The Bid Price!</h3>
        <p className="mb-4">
          Before you place a bid, you want to start by checking the round details.
        </p>
        <p className="mb-4">Review these 4 fields before placing a bid:</p>

        <p className="mb-8">
          1. <b>[Round Timer]:</b> At the top left of the website, you will see a countdown timer
          ticking down. At the start of each round, this timer is reset to 24 hours. Every time
          someone places a bid, the timer adds 1 hour. The last person to bid when the timer runs
          out wins the game.
        </p>

        <div className="mb-8">
          <Image
            src="/images/screenshot2.png"
            width={1200}
            height={675}
            alt="Round timer screenshot"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <p className="mb-4">
          2. <b>[Bid Price]:</b> Before you place a bid, you want to check the bid price. You can
          make a bid using $ETH or Cosmic Signature Tokens ($CST).
        </p>
        <p className="mb-8">
          If you hold an NFT from our sister collection Random Walk NFT, you can get a 50% discount
          on your $ETH bid price. However, keep in mind that you can avail the 50% discount once, so
          be wise about using it.
        </p>

        <div className="mb-8">
          <Image
            src="/images/screenshot3.png"
            width={1200}
            height={675}
            alt="Bid price screenshot"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <p className="mb-8">
          3. <b>[Main Prize Reward]:</b> The Main Prize Reward displays the amount you will get if
          you win the round.
        </p>
        <div className="mb-8">
          <Image
            src="/images/screenshot4.png"
            width={1200}
            height={675}
            alt="Main prize reward screenshot"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <p className="mb-4">
          4. <b>[Last Bidder Address]:</b> The wallet address of the last person that made a bid.
        </p>
        <p className="mb-4">
          Make sure you hold the displayed bid price in your crypto wallet (in $ETH or $CST) and a
          few extra cents to pay for gas on the Arbitrum blockchain.
        </p>
      </div>

      {/* Step 3 */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-8">Step#3: Make A Bid!</h3>
        <p className="mb-4">
          Once you have successfully connected your wallet, choose your method of bidding from $ETH
          or $CST.
        </p>
        <p className="mb-4">
          If you wish to avail your 50% Random Walk NFT discount, click [Random Walk].
        </p>
        <p className="mb-4">
          When you click your desired currency, you will be displayed the bid price button.
        </p>
        <p className="mb-4">
          Review this price and when you want to make a bid, click the [Bid Now] button.
        </p>
        <p className="mb-4">
          As soon as you click this button, you will be prompted to your wallet and asked to confirm
          the transaction.
        </p>
        <p className="mb-4">
          Make sure to review your transaction before signing it. Also check the gas fees, and then
          approve the transaction.
        </p>
        <p className="mb-4">
          When you make a bid, the countdown timer will increase by 1 hour, and the next bid price
          will increase by 1%. When the timer reaches zero, the last player to make the bid will win
          the round.
        </p>
      </div>

      {/* Accordions */}
      <div className="mt-16">
        <Accordion type="single" collapsible>
          <AccordionItem value="rewards">
            <AccordionTrigger className="text-xl font-semibold">
              How To Claim My Rewards?
            </AccordionTrigger>
            <AccordionContent>
              <p>For each bid you make, you get:</p>
              <ul className="list-disc pl-6 my-2">
                <li>100 Cosmic Signature Tokens as a reward</li>
                <li>1 raffle ticket</li>
                <li>A chance to win the Cosmic Signature NFT</li>
              </ul>
              <p className="mb-4">
                When you win, you get 32% of the prize pool. You will be required to withdraw this
                prize money from a special contract.
              </p>
              <p className="mb-4">
                At the end of each round, 4 raffle tickets will be chosen at random by our smart
                contract to win 6% of the pot. Also, 5 additional winners and 4 Random Walk NFT
                stakers will be chosen who will receive a Cosmic Signature NFT.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tips">
            <AccordionTrigger className="text-xl font-semibold">
              Things To Keep In Mind:
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6">
                <li className="mb-2">
                  You can check the full bid history for each round under{' '}
                  <b>[Current Round Bid History]</b> at the end of the homepage.
                </li>
                <li className="mb-2">You earn 100 CST every time you place a bid.</li>
                <li className="mb-2">
                  Every time you bid, you are also buying a raffle ticket. The more times you bid,
                  the higher your chances of winning the raffle.
                </li>
                <li className="mb-2">
                  At the end of each round, the bid price resets to approximately 100 times lower
                  than the winning bid price of the previous round.
                </li>
                <li className="mb-2">
                  TIP: We have a secure and audited smart contract, but if you are unsure it&apos;s
                  always safe to use a burner wallet when bidding.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Closing Notes */}
      <p className="mt-16">
        If you have any questions or confusion, feel free to ask them in the{' '}
        <a
          href="https://discord.com/channels/1258032742084509779/1258691600951935056"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          #cosmic-gameroom
        </a>{' '}
        channel inside our Discord, or{' '}
        <a
          href="https://x.com/CosmicSignatureNFT"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          write us a message on Twitter/X
        </a>
        .
      </p>
      <p className="italic mt-4">Happy bidding!</p>
    </MainWrapper>
  );
};

export default HowToPlayPage;
