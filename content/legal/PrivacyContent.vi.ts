import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyVi = {
  title: 'Privacy Policy',
  subtitle:
    'Your privacy is important to us. This policy explains how Cosmic Signature collects, uses, and protects your information when you interact with our decentralized application.',
  homeLabel: 'Home',
  lastUpdated: 'Last updated: July 20, 2026',
  introductionTitle: 'Introduction',
  introduction: [
    'Cosmic Signature is a decentralized blockchain game built on Arbitrum, an Ethereum Layer 2 network. As a decentralized application (dApp), we operate differently from traditional web applications when it comes to data and privacy.',
    'This Privacy Policy describes how we handle information in connection with your use of Cosmic Signature. By using our platform, you agree to the collection and use of information in accordance with this policy.',
  ],
  sections: [
    {
      id: 'collection',
      title: 'Information We Collect',
      content: [
        {
          id: 'wallet',
          subtitle: 'Wallet Information',
          text: 'When you connect your Web3 wallet to use Cosmic Signature, we collect your public wallet address. This is necessary to process transactions, display your NFTs, track your gestures, and distribute allocations.',
        },
        {
          id: 'transactions',
          subtitle: 'Transaction Data',
          text: 'We collect information about your interactions with our smart contracts, including gestures made, NFTs received, anchoring activities, and allocation retrievals. All of this data is publicly available on the blockchain.',
        },
        {
          id: 'usage',
          subtitle: 'Usage Data',
          text: 'We may collect anonymous usage data such as pages visited, time spent on the platform, and general interaction patterns to improve our service.',
        },
      ],
    },
    {
      id: 'use',
      title: 'How We Use Your Information',
      content: [
        {
          id: 'delivery',
          subtitle: 'Service Delivery',
          text: 'Your wallet address and transaction data are used to provide you with the protocol services, including processing gestures, managing NFTs, distributing allocations, and displaying your protocol statistics.',
        },
        {
          id: 'improvement',
          subtitle: 'Platform Improvement',
          text: 'We use aggregated, anonymous data to improve the platform, fix bugs, and develop new features.',
        },
        {
          id: 'communication',
          subtitle: 'Communication',
          text: 'We may use your information to send important updates about the platform, such as security notifications or major changes to the protocol mechanics.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Data Security',
      content: [
        {
          id: 'blockchain',
          subtitle: 'Blockchain Security',
          text: 'Protocol settlement occurs on Arbitrum, an Ethereum Layer 2 network. Connecting a wallet by itself is non-custodial and does not transfer assets. When you explicitly approve and sign a smart-contract action, however, that transaction can transfer assets to a protocol contract or lock them there until the applicable release or retrieval conditions are met.',
        },
        {
          id: 'infrastructure',
          subtitle: 'Infrastructure Security',
          text: 'Our web infrastructure uses industry-standard security measures including HTTPS encryption, secure hosting, and regular security audits.',
        },
        {
          id: 'passwords',
          subtitle: 'No Passwords',
          text: 'We never ask for or store passwords. Authentication is handled entirely through your Web3 wallet.',
        },
      ],
    },
    {
      id: 'sharing',
      title: 'Data Sharing and Disclosure',
      content: [
        {
          id: 'public-chain',
          subtitle: 'Public Blockchain Data',
          text: 'All blockchain transactions are public by nature. Your wallet address, gestures, NFT ownership, and allocations are visible on the blockchain and through our platform.',
        },
        {
          id: 'third-party',
          subtitle: 'Third-Party Services',
          text: 'We may use third-party services for analytics, hosting, and infrastructure. These services are bound by their own privacy policies and we ensure they meet appropriate data protection standards.',
        },
        {
          id: 'legal',
          subtitle: 'Legal Requirements',
          text: 'We may disclose information if required by law, court order, or government regulation.',
        },
      ],
    },
    {
      id: 'rights',
      title: 'Your Rights and Choices',
      content: [
        {
          id: 'wallet',
          subtitle: 'Wallet Control',
          text: 'You maintain full control over your wallet and can disconnect it from our platform at any time.',
        },
        {
          id: 'permanence',
          subtitle: 'Blockchain Permanence',
          text: 'Please note that blockchain transactions are permanent and cannot be deleted. Once a gesture is made or an NFT is transferred, this information remains on the blockchain forever.',
        },
        {
          id: 'cookies',
          subtitle: 'Cookie Preferences',
          text: 'Our website may use cookies for basic functionality. You can control cookie settings through your browser.',
        },
      ],
    },
  ],
  additionalTitle: 'Additional Information',
  additional: [
    {
      id: 'children',
      subtitle: "Children's Privacy",
      text: 'Our service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.',
    },
    {
      id: 'changes',
      subtitle: 'Changes to This Policy',
      text: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.',
    },
    {
      id: 'contact',
      subtitle: 'Contact Information',
      text: 'If you have any questions about this Privacy Policy, please contact us through our official community channels or GitHub repository.',
    },
    {
      id: 'international',
      subtitle: 'International Users',
      text: 'Cosmic Signature settles on Arbitrum, a globally accessible Ethereum Layer 2 network. By using our platform, you acknowledge that your information may be processed and stored in various locations around the world.',
    },
  ],
  notice: {
    title: 'Important: blockchain transparency',
    text: 'Please be aware that blockchain transactions are public and permanent. Your wallet address and all your interactions with our smart contracts are publicly visible and cannot be deleted. This is a fundamental characteristic of blockchain technology, not a limitation of our privacy practices.',
  },
} as const satisfies PrivacyCopy;
