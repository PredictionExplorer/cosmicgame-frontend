'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const legalCard =
  'rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-none backdrop-blur-sm';

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Wallet Information',
        text: 'When you connect your Web3 wallet to use Cosmic Signature, we collect your public wallet address. This is necessary to process transactions, display your NFTs, track your gestures, and distribute allocations.',
      },
      {
        subtitle: 'Transaction Data',
        text: 'We collect information about your interactions with our smart contracts, including gestures made, NFTs received, anchoring activities, and allocation retrievals. All of this data is publicly available on the blockchain.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We may collect anonymous usage data such as pages visited, time spent on the platform, and general interaction patterns to improve our service.',
      },
    ],
  },
  {
    icon: Lock,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Service Delivery',
        text: 'Your wallet address and transaction data are used to provide you with the protocol services, including processing gestures, managing NFTs, distributing allocations, and displaying your protocol statistics.',
      },
      {
        subtitle: 'Platform Improvement',
        text: 'We use aggregated, anonymous data to improve the platform, fix bugs, and develop new features.',
      },
      {
        subtitle: 'Communication',
        text: 'We may use your information to send important updates about the platform, such as security notifications or major changes to the protocol mechanics.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Data Security',
    content: [
      {
        subtitle: 'Blockchain Security',
        text: 'All protocol transactions are secured by the Ethereum blockchain. We do not have custody of your funds or NFTs - they remain in your wallet at all times.',
      },
      {
        subtitle: 'Infrastructure Security',
        text: 'Our web infrastructure uses industry-standard security measures including HTTPS encryption, secure hosting, and regular security audits.',
      },
      {
        subtitle: 'No Passwords',
        text: 'We never ask for or store passwords. Authentication is handled entirely through your Web3 wallet.',
      },
    ],
  },
  {
    icon: Eye,
    title: 'Data Sharing and Disclosure',
    content: [
      {
        subtitle: 'Public Blockchain Data',
        text: 'All blockchain transactions are public by nature. Your wallet address, gestures, NFT ownership, and allocations are visible on the blockchain and through our platform.',
      },
      {
        subtitle: 'Third-Party Services',
        text: 'We may use third-party services for analytics, hosting, and infrastructure. These services are bound by their own privacy policies and we ensure they meet appropriate data protection standards.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose information if required by law, court order, or government regulation.',
      },
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Rights and Choices',
    content: [
      {
        subtitle: 'Wallet Control',
        text: 'You maintain full control over your wallet and can disconnect it from our platform at any time.',
      },
      {
        subtitle: 'Blockchain Permanence',
        text: 'Please note that blockchain transactions are permanent and cannot be deleted. Once a gesture is made or an NFT is transferred, this information remains on the blockchain forever.',
      },
      {
        subtitle: 'Cookie Preferences',
        text: 'Our website may use cookies for basic functionality. You can control cookie settings through your browser.',
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <MainWrapper className="max-sm:pb-16">
      <PageHeader
        title="Privacy Policy"
        subtitle="Your privacy is important to us. This policy explains how Cosmic Signature collects, uses, and protects your information when you interact with our decentralized application."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
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
        <Card className={legalCard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
              <Shield className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <span>Introduction</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Cosmic Signature is a decentralized blockchain game built on Ethereum. As a
              decentralized application (dApp), we operate differently from traditional web
              applications when it comes to data and privacy.
            </p>
            <p>
              This Privacy Policy describes how we handle information in connection with your use of
              Cosmic Signature. By using our platform, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

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
                    <h3 className="font-semibold text-foreground">{item.subtitle}</h3>
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
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Children&apos;s Privacy</h3>
              <p className="leading-relaxed">
                Our service is not intended for users under the age of 18. We do not knowingly
                collect personal information from children. If you are a parent or guardian and
                believe your child has provided us with personal information, please contact us.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Changes to This Policy</h3>
              <p className="leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &quot;Last
                updated&quot; date. You are advised to review this Privacy Policy periodically for
                any changes.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Contact Information</h3>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our
                official community channels or GitHub repository.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">International Users</h3>
              <p className="leading-relaxed">
                Cosmic Signature operates on the Ethereum blockchain, which is globally accessible.
                By using our platform, you acknowledge that your information may be processed and
                stored in various locations around the world.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(legalCard, 'border-primary/25 bg-primary/[0.06]')}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Important: blockchain transparency
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Please be aware that blockchain transactions are public and permanent. Your wallet
                  address and all your interactions with our smart contracts are publicly visible
                  and cannot be deleted. This is a fundamental characteristic of blockchain
                  technology, not a limitation of our privacy practices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainWrapper>
  );
}
