'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  AlertTriangle,
  Scale,
  Shield,
  Users,
  Coins,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const legalCard =
  'rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-none backdrop-blur-sm';

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: [
      {
        text: 'By accessing and using Cosmic Signature, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.',
      },
      {
        text: 'These terms constitute a legally binding agreement between you and Cosmic Signature. We reserve the right to modify these terms at any time, and such modifications will be effective immediately upon posting.',
      },
    ],
  },
  {
    icon: Users,
    title: 'Eligibility and Account Requirements',
    content: [
      {
        subtitle: 'Age Requirement',
        text: 'You must be at least 18 years old to use Cosmic Signature. By using this platform, you represent and warrant that you meet this age requirement.',
      },
      {
        subtitle: 'Wallet Responsibility',
        text: 'You are solely responsible for maintaining the security of your Web3 wallet and private keys. Cosmic Signature will never ask for your private keys or seed phrase. Loss of access to your wallet may result in permanent loss of NFTs and funds.',
      },
      {
        subtitle: 'Legal Compliance',
        text: 'You agree to comply with all applicable laws and regulations in your jurisdiction when using Cosmic Signature, including those related to cryptocurrency, online gaming, and blockchain technology.',
      },
    ],
  },
  {
    icon: Coins,
    title: 'Game Mechanics and Smart Contracts',
    content: [
      {
        subtitle: 'How the Game Works',
        text: 'Cosmic Signature is a decentralized auction game where users place bids using ETH or CST tokens. The last bidder when the timer expires wins the main prize. Additional prizes are distributed according to the published prize structure.',
      },
      {
        subtitle: 'Smart Contract Interaction',
        text: 'All game actions are executed through smart contracts on the Ethereum blockchain. Once a transaction is confirmed on the blockchain, it cannot be reversed. You acknowledge that blockchain transactions are final and irreversible.',
      },
      {
        subtitle: 'Gas Fees',
        text: 'You are responsible for paying all Ethereum network gas fees associated with your transactions. Gas fees are separate from bid amounts and are paid to Ethereum miners, not to Cosmic Signature.',
      },
      {
        subtitle: 'Random Walk NFT Discount',
        text: 'Random Walk NFTs can be used once per NFT to receive a 50% discount on ETH bids. This action is permanent and cannot be undone. Once used, a Random Walk NFT cannot be used again for discounts.',
      },
    ],
  },
  {
    icon: Scale,
    title: 'Prizes and Payouts',
    content: [
      {
        subtitle: 'Prize Distribution',
        text: 'Prizes are distributed automatically according to the smart contract rules. The current prize structure includes Main Prize (25% ETH + NFT), Endurance Champion (CST + NFT), Last CST Bidder (CST + NFT), Chrono-Warrior (8% ETH), Raffle prizes (4% ETH + 9 NFTs), NFT Stakers (6% ETH), and Charity (7% ETH).',
      },
      {
        subtitle: 'Claiming Prizes',
        text: 'Some prizes require manual claiming through the platform. The Main Prize winner has 24 hours to claim their prize after the round ends. If not claimed within this period, the prize may become available for others to claim according to smart contract rules.',
      },
      {
        subtitle: 'No Guaranteed Returns',
        text: 'Participation in Cosmic Signature does not guarantee any returns or profits. All bids are considered final, and you may lose the full amount of your bid. Never bid more than you can afford to lose.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Risks and Disclaimers',
    content: [
      {
        subtitle: 'Blockchain Technology Risks',
        text: 'You acknowledge the risks inherent in blockchain technology, including but not limited to: smart contract vulnerabilities, network congestion, gas price volatility, regulatory changes, and potential loss of funds due to technical issues.',
      },
      {
        subtitle: 'No Warranties',
        text: "Cosmic Signature is provided 'as is' without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or free from harmful components.",
      },
      {
        subtitle: 'Market Volatility',
        text: 'Cryptocurrency and NFT markets are highly volatile. The value of ETH, CST tokens, and NFTs may fluctuate significantly. Past performance is not indicative of future results.',
      },
      {
        subtitle: 'Smart Contract Audits',
        text: 'While we strive to ensure the security of our smart contracts, no audit can guarantee complete security. You use the platform at your own risk.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Prohibited Activities',
    content: [
      {
        text: 'You agree not to engage in any of the following prohibited activities:',
      },
      {
        text: '• Attempting to manipulate or exploit the game mechanics through bugs, glitches, or vulnerabilities',
      },
      {
        text: '• Using bots, scripts, or automated tools to interact with the platform',
      },
      {
        text: '• Engaging in any form of market manipulation or collusion with other users',
      },
      {
        text: "• Attempting to hack, reverse engineer, or compromise the platform's security",
      },
      {
        text: '• Violating any applicable laws or regulations',
      },
      {
        text: '• Creating multiple accounts to gain unfair advantages',
      },
      {
        text: '• Uploading malicious content or attempting denial-of-service attacks',
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <MainWrapper className="max-sm:pb-16">
      <PageHeader
        title="Terms of Service"
        subtitle="Please read these terms carefully before using Cosmic Signature. By using our platform, you agree to be bound by these terms."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]}
        className="mb-10 max-w-3xl md:mx-auto md:text-center"
      />

      <div className="mb-8 flex justify-center md:mx-auto md:max-w-3xl md:text-center">
        <Badge
          variant="outline"
          className="border-primary/35 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          Last updated: April 17, 2026
        </Badge>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={legalCard}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
                  <section.icon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-2">
                    {'subtitle' in item && item.subtitle ? (
                      <h3 className="font-semibold text-foreground">{item.subtitle}</h3>
                    ) : null}
                    <p className="leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <Card className={legalCard}>
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold tracking-tight">
              Additional Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Intellectual Property</h3>
              <p className="leading-relaxed">
                All content on Cosmic Signature, including but not limited to text, graphics, logos,
                and software, is the property of Cosmic Signature or its licensors and is protected by
                copyright and other intellectual property laws. NFTs awarded through the game grant you
                ownership of the specific token, but not the underlying intellectual property unless
                explicitly stated.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Limitation of Liability</h3>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, Cosmic Signature and its affiliates shall not
                be liable for any indirect, incidental, special, consequential, or punitive damages, or
                any loss of profits or revenues, whether incurred directly or indirectly, or any loss of
                data, use, goodwill, or other intangible losses resulting from your use of the platform.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Indemnification</h3>
              <p className="leading-relaxed">
                You agree to indemnify and hold harmless Cosmic Signature and its affiliates from any
                claims, losses, damages, liabilities, and expenses (including legal fees) arising from
                your use of the platform, your violation of these terms, or your violation of any rights of
                another party.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Dispute Resolution</h3>
              <p className="leading-relaxed">
                Any disputes arising from these terms or your use of Cosmic Signature shall be resolved
                through binding arbitration in accordance with the rules of the American Arbitration
                Association. You waive any right to a jury trial or to participate in a class action
                lawsuit.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Governing Law</h3>
              <p className="leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the
                jurisdiction where Cosmic Signature operates, without regard to its conflict of law
                provisions.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Severability</h3>
              <p className="leading-relaxed">
                If any provision of these terms is found to be invalid or unenforceable, the remaining
                provisions shall continue in full force and effect.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Entire Agreement</h3>
              <p className="leading-relaxed">
                These terms constitute the entire agreement between you and Cosmic Signature regarding
                your use of the platform and supersede any prior agreements.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Contact Information</h3>
              <p className="leading-relaxed">
                If you have questions about these Terms of Service, please contact us through our official
                community channels or GitHub repository.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            legalCard,
            'border-amber-500/35 bg-amber-500/[0.06] dark:border-amber-400/25 dark:bg-amber-400/[0.06]',
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle
                className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Important warning</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Participating in Cosmic Signature involves financial risk. Cryptocurrency and NFT markets
                  are highly volatile, and you may lose some or all of your investment. Never spend more than
                  you can afford to lose. This platform is not an investment vehicle, and no returns are
                  guaranteed. Always do your own research and consider your financial situation carefully
                  before participating.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(legalCard, 'border-primary/25 bg-primary/[0.06]')}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Acknowledgment</h3>
                <p className="leading-relaxed text-muted-foreground">
                  By using Cosmic Signature, you acknowledge that you have read, understood, and agree to be
                  bound by these Terms of Service. You also acknowledge that you understand the risks
                  associated with blockchain technology, cryptocurrency, and NFTs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainWrapper>
  );
}
