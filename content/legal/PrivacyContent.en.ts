import type { PrivacyCopy } from './PrivacyContent';

export const privacyCopyEn = {
  title: 'Privacy Policy',
  subtitle:
    'How Cosmic Signature handles information when you use the app and the project site: what is public on-chain, what the site measures and stores, and which services receive what.',
  inShort: {
    title: 'In short',
    points: [
      'Your wallet address and everything you do on-chain are public and permanent: anyone can read them on Arbitrum, and no one can delete them.',
      'Connecting a wallet shares only its public address. We never ask for your seed phrase, private keys or a password, and we do not collect your name or email address.',
      'The site measures visits and reports errors through the named services below, and sets only the cookies listed below.',
    ],
  },
  withoutErrorReports: {
    inShortMeasure:
      'The site measures visits through the named services below, and sets only the cookies listed below.',
    improvement: 'We use aggregated usage data to fix problems and improve the site.',
  },
  introductionTitle: 'Introduction',
  introduction: [
    'Cosmic Signature is a procedural on-chain art protocol built on Arbitrum, an Ethereum Layer 2 network. As a decentralized application (dApp), it works differently from traditional web applications when it comes to data and privacy.',
    'This Privacy Policy describes how we handle information in connection with your use of Cosmic Signature. By using our platform, you agree to the collection and use of information in accordance with this policy.',
  ],
  sections: [
    {
      id: 'collection',
      title: 'Information we collect',
      content: [
        {
          id: 'wallet',
          subtitle: 'Wallet information',
          text: 'When you connect your Web3 wallet to use Cosmic Signature, we receive your public wallet address. It is needed to process transactions, display your NFTs, track your gestures and distribute allocations.',
        },
        {
          id: 'transactions',
          subtitle: 'Transaction data',
          text: 'We read your interactions with the smart contracts, including gestures made, NFTs received, anchoring activity and allocation retrievals. All of this data is publicly available on the blockchain.',
        },
        {
          id: 'usage',
          subtitle: 'Usage data',
          text: 'We measure how the site is used: the pages viewed, how quickly they load, the referring site, and the country, browser and device type of a visit. The analytics services that do this are listed under <privacyServices>Services we use</privacyServices>.',
        },
      ],
    },
    {
      id: 'use',
      title: 'How we use your information',
      content: [
        {
          id: 'delivery',
          subtitle: 'Service delivery',
          text: 'Your wallet address and transaction data are used to provide the protocol services: processing gestures, showing your NFTs, distributing allocations and displaying your protocol statistics.',
        },
        {
          id: 'improvement',
          subtitle: 'Platform improvement',
          text: 'We use aggregated usage data and error reports to fix bugs and improve the site.',
        },
        {
          id: 'communication',
          subtitle: 'Communication',
          text: 'We do not collect email addresses or other contact details, so we do not contact you directly. Announcements, including security notices and changes to the protocol, are posted on <x>X</x> and <discord>Discord</discord>.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Data security',
      content: [
        {
          id: 'blockchain',
          subtitle: 'Blockchain security',
          text: 'Protocol settlement occurs on Arbitrum, an Ethereum Layer 2 network. Connecting a wallet by itself is non-custodial and does not transfer assets. When you explicitly approve and sign a smart-contract action, however, that transaction can transfer assets to a protocol contract or lock them there until the applicable release or retrieval conditions are met.',
        },
        {
          id: 'infrastructure',
          subtitle: 'Infrastructure security',
          text: 'The site is served only over HTTPS, from Vercel’s hosting platform. The smart contracts were independently audited; see <audits>Audits</audits>.',
        },
        {
          id: 'passwords',
          subtitle: 'No passwords',
          text: 'We never ask for or store passwords. Authentication is handled entirely through your Web3 wallet.',
        },
      ],
    },
    {
      id: 'sharing',
      title: 'Data sharing and disclosure',
      content: [
        {
          id: 'public-chain',
          subtitle: 'Public blockchain data',
          text: 'All blockchain transactions are public by nature. Your wallet address, gestures, NFT ownership and allocations are visible on the blockchain and through our platform.',
        },
        {
          id: 'third-party',
          subtitle: 'Third-party services',
          text: 'The services listed under <privacyServices>Services we use</privacyServices> receive the data described there and process it under their own privacy policies, linked in the table.',
        },
        {
          id: 'legal',
          subtitle: 'Legal requirements',
          text: 'We may disclose information if required by law, court order, or government regulation.',
        },
      ],
    },
    {
      id: 'rights',
      title: 'Your rights and choices',
      content: [
        {
          id: 'wallet',
          subtitle: 'Wallet control',
          text: 'You keep full control over your wallet and can disconnect it from the site at any time.',
        },
        {
          id: 'permanence',
          subtitle: 'Blockchain permanence',
          text: 'Blockchain transactions are permanent and cannot be deleted. Once a gesture is made or an NFT is transferred, the record stays on the blockchain.',
        },
        {
          id: 'cookies',
          subtitle: 'Cookie preferences',
          text: 'The site sets only the cookies listed under <privacyStorage>Cookies and browser storage</privacyStorage>. You can delete or block them in your browser settings; the site keeps working but forgets your palette and language.',
        },
      ],
    },
  ],
  services: {
    heading: 'Services we use',
    intro:
      'This site uses the services below. Each processes the data listed under its own privacy policy.',
    columns: {
      service: 'Service',
      purpose: 'Purpose',
      data: 'Data it receives',
      policy: 'Privacy policy',
    },
    policyLink: 'Policy',
    ownPolicy: 'This policy',
    none: 'None listed',
    items: {
      vercel: {
        purpose: 'Hosts and delivers the site',
        data: 'Your IP address and browser details, in request logs',
      },
      vercelAnalytics: {
        purpose: 'Counts page views and measures page speed, without cookies',
        data: 'Pages viewed, referring site, country, browser and device type',
      },
      googleAnalytics: {
        purpose: 'Measures how visitors use the site',
        data: 'Pages viewed, approximate location, browser and device, through cookies',
      },
      sentry: {
        purpose: 'Reports errors so they can be fixed',
        data: 'The error, the page, your browser, and a replay of the moments before it with all text and inputs masked',
      },
      api: {
        purpose: 'Serves the protocol data the pages show',
        data: 'The records you open, including any wallet address you look up',
      },
      rpc: {
        purpose: 'Reads the contracts on Arbitrum and relays the transactions you sign',
        data: 'Your IP address, the addresses read and the transactions you send',
      },
      walletConnect: {
        purpose: 'Connects mobile and QR-code wallets',
        data: 'Your wallet address and the encrypted messages between the site and your wallet',
      },
      coingecko: {
        purpose: 'Supplies ETH and CST prices in US dollars',
        data: 'Your IP address, when a page shows a dollar price',
      },
    },
  },
  storage: {
    heading: 'Cookies and browser storage',
    intro:
      'The site stores these on your device. None holds your name or contact details. Cookies travel with your requests; browser storage stays on your device.',
    columns: {
      name: 'Name',
      kind: 'Type',
      purpose: 'Purpose',
      lifetime: 'Kept for',
    },
    kinds: {
      cookie: 'Cookie',
      browser: 'Browser storage',
    },
    lifetimes: {
      oneYear: '1 year',
      twoYears: '2 years',
      untilCleared: 'Until you clear it',
      untilTabClosed: 'Until you close the tab',
    },
    items: {
      themeCookie: 'Remembers your palette on both Cosmic Signature sites',
      localeCookie: 'Remembers the language you chose',
      gaCookies: 'Tells repeat visits apart for Google Analytics',
      themeStorage: 'Remembers your palette on this site',
      attention: 'Remembers your finalization alert and sound settings',
      artMotion: 'Remembers that you paused the artwork on the experimental home',
      quizProgress:
        'Keeps a quiz attempt in progress, so you can return to it after reading a reference',
      quizBest: 'Remembers your best score on each quiz',
      wallet: 'Remembers which wallet you connected, so the app can reconnect it',
    },
  },
  additionalTitle: 'Additional information',
  additional: [
    {
      id: 'children',
      subtitle: 'Children’s privacy',
      text: 'Our service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.',
    },
    {
      id: 'changes',
      subtitle: 'Changes to this policy',
      text: 'We may update this Privacy Policy from time to time. We post every change on this page and update the “Last updated” date at the top, and each change is visible in the policy’s <privacyHistory>revision history</privacyHistory>.',
    },
    {
      id: 'contact',
      subtitle: 'Contact information',
      text: 'If you have questions about this Privacy Policy, contact us at <support>support@cosmicsignature.com</support>, on <discord>Discord</discord> or on <x>X</x>.',
    },
    {
      id: 'international',
      subtitle: 'International users',
      text: 'Cosmic Signature settles on Arbitrum, a globally accessible Ethereum Layer 2 network. By using our platform, you acknowledge that your information may be processed and stored in various locations around the world.',
    },
  ],
} as const satisfies PrivacyCopy;
