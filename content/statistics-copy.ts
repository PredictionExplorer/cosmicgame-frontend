export const statisticsCopy = {
  metrics: {
    activePerformanceCycle: {
      label: 'Active Performance Cycle',
      tooltip: 'The current Performance Cycle number indexed by the public Cosmic Signature API.',
      seoDescription:
        'Current Performance Cycle number indexed from Cosmic Signature activity on Arbitrum.',
    },
    activeCycleGestures: {
      label: 'Active Cycle Gestures',
      tooltip: 'Number of indexed gestures made in the active Performance Cycle so far.',
      seoDescription: 'Indexed gesture count for the active Performance Cycle.',
    },
    totalCycles: {
      label: 'Total Cycles',
      tooltip: 'Total Performance Cycles completed or currently indexed since protocol launch.',
    },
    allocationsDistributed: {
      label: 'Allocations Distributed',
      tooltip:
        'Indexed allocation records across all cycles. Includes recipient allocations and protocol allocation markers such as Anchor Distribution deposits.',
    },
    cosmicSignatureNftsImprinted: {
      label: 'Cosmic Signature NFTs Imprinted',
      shortLabel: 'NFTs Imprinted',
      tooltip:
        'Cumulative count of Cosmic Signature NFT ERC-721 tokens imprinted by the protocol across all indexed cycles. A value of 0 means the statistics API is currently reporting no indexed imprints for this counter.',
      seoDescription:
        'Cumulative Cosmic Signature NFT ERC-721 tokens imprinted by the protocol across all indexed cycles.',
    },
    contractBalance: {
      label: 'Contract Balance',
      seoLabel: 'Protocol Contract Balance',
      tooltip:
        'ETH currently held by the Cosmic Signature protocol contract before future allocations, retrievals, or cycle transitions.',
      seoDescription:
        'ETH currently held by the Cosmic Signature protocol contract before future allocation flows.',
    },
    numAllocationsDistributed: {
      label: 'Num Allocations Distributed',
      tooltip:
        'Indexed allocation-record count. Uses cg_prize rows when available, otherwise falls back to aggregated recipient allocation totals.',
    },
    totalSignatureAllocationsDistributed: {
      label: 'Total Signature Allocations Distributed',
      tooltip:
        'Total ETH distributed through Signature Allocations to final-gesture recipients across indexed cycles.',
    },
    stellarSelectionEthDeposited: {
      label: 'Stellar Selection ETH Deposited',
      tooltip:
        'Total ETH allocated into Stellar Selection pools across indexed Performance Cycles.',
    },
    stellarSelectionEthRetrieved: {
      label: 'Stellar Selection ETH Retrieved',
      tooltip: 'Total ETH retrieved by selected recipients from Stellar Selection pools.',
    },
    totalSupplyErc20: {
      label: 'Total Supply (ERC-20)',
      tooltip:
        'Current total supply of Cosmic Signature Tokens (CST), the ERC-20 token used for participation and coordination.',
    },
    totalCstConsumed: {
      label: 'Total CST Consumed',
      tooltip: 'Cumulative CST spent by participants when making CST gestures.',
    },
    cstGestures: {
      label: 'Gestures with CST',
      tooltip: 'Number of gestures made with CST instead of ETH across indexed cycles.',
    },
    outreachReserve: {
      label: 'Outreach Reserve',
      tooltip:
        'CST imprinted for outreach and ecosystem contributors, separate from per-gesture Participation CST and NFT-paired Recognition CST.',
    },
    outreachTransactions: {
      label: 'Outreach Transactions',
      tooltip: 'Number of indexed Outreach Reserve distribution transactions.',
    },
    randomWalkNftsUsed: {
      label: 'RandomWalk NFTs Used',
      tooltip:
        'RandomWalk NFTs already attached to ETH gestures for a one-time Gesture Cost reduction.',
    },
    namedTokens: {
      label: 'Named Tokens',
      tooltip: 'Cosmic Signature NFTs that currently have a custom owner-assigned name.',
    },
    uniqueParticipants: {
      label: 'Unique Participants',
      tooltip: 'Unique wallet addresses that have made at least one indexed gesture.',
    },
    uniqueRecipients: {
      label: 'Unique Recipients',
      tooltip:
        'Unique wallet addresses that have received at least one indexed allocation from the protocol.',
    },
    uniqueEthContributors: {
      label: 'Unique ETH Contributors',
      tooltip: 'Unique wallet addresses that contributed ETH to the protocol.',
    },
    uniqueAnchorHolders: {
      label: 'Unique Anchor-holders',
      tooltip:
        'Combined unique wallets that have anchored Cosmic Signature NFTs or RandomWalk NFTs.',
    },
    cosmicSignatureNftHolders: {
      label: 'Cosmic Signature NFT Holders',
      tooltip: 'Unique wallet addresses currently holding at least one Cosmic Signature NFT.',
    },
    cstErc20Holders: {
      label: 'CST (ERC-20) Holders',
      tooltip: 'Unique wallet addresses currently holding CST ERC-20 tokens.',
    },
    attachedNfts: {
      label: 'Attached NFTs',
      tooltip: 'ERC-721 tokens attached to gestures by participants and indexed by the app.',
    },
    publicGoodsBalance: {
      label: 'Public Goods Balance',
      tooltip:
        'ETH allocated to the Public Goods Beneficiary and still reflected in indexed protocol balances.',
    },
    totalContributedEth: {
      label: 'Total Contributed ETH',
      tooltip: 'Total ETH contributed to the protocol across all indexed cycles.',
    },
    protocolContributions: {
      label: 'Protocol Contributions',
      tooltip:
        'Number of indexed public-goods contribution transactions sent through the Cosmic Signature protocol.',
    },
    protocolContributionsSum: {
      label: 'Protocol Contributions Sum',
      tooltip:
        'Total ETH contributed through indexed Cosmic Signature protocol public-goods contribution transactions.',
    },
    voluntaryContributions: {
      label: 'Voluntary Contributions',
      tooltip:
        'ETH contributions made voluntarily by community members outside required cycle flows.',
    },
    publicGoodsRetrievals: {
      label: 'Public Goods Retrievals',
      tooltip: 'Number of indexed retrieval transactions from the Public Goods Vault.',
    },
    totalPublicGoodsRetrieved: {
      label: 'Total Public Goods Retrieved',
      tooltip: 'Total ETH retrieved from the Public Goods Vault.',
    },
  },
  groups: {
    allocationEconomy:
      'Cumulative allocation records and ETH flows produced when Performance Cycles finalize.',
    tokenEconomy:
      'CST and NFT counters. CST is the ERC-20 token; Cosmic Signature NFTs are ERC-721 tokens.',
    publicGoods:
      'Protocol balances and contribution flows related to public goods and attached assets.',
  },
  sections: {
    attachedTokenDistribution:
      'Contracts and token counts for ERC-721 assets attached to gestures.',
    cosmicSignatureTokenDistribution:
      'Current owner distribution for Cosmic Signature NFT ERC-721 tokens.',
    cstBalanceDistribution: 'Current wallet distribution for CST ERC-20 balances.',
    cstTotalSupply:
      'Historical CST ERC-20 supply changes, including imprints and consumption over time.',
    cycleActivations:
      'System event windows that show when protocol cycles or modes became active and ended.',
    uniqueParticipants: 'Wallets with at least one indexed gesture, sorted by gesture count.',
    uniqueRecipients: 'Wallets that received indexed protocol allocations.',
    uniqueEthContributors: 'Wallets that contributed ETH to the protocol.',
    anchorReleaseActions: 'Chronological anchor and release actions for the selected NFT type.',
    anchoredTokens: 'Tokens currently anchored in the selected anchoring wallet.',
    uniqueAnchorHolders: 'Wallets that have anchored or released the selected NFT type.',
    gestureFrequency:
      'Indexed gesture counts grouped over time to show protocol activity patterns.',
    gestureSpikes:
      'Periods where gesture activity changed quickly compared with surrounding activity.',
    participantActivePeriods:
      'The longest indexed active participation windows for the most active wallets.',
  },
  anchoring: {
    cstActiveAnchorHolders: 'Wallets currently anchoring at least one Cosmic Signature NFT.',
    cstAnchorDistributionDeposits:
      'Total deposit events into the Cosmic Signature NFT Anchor Distribution pool.',
    cstTotalAnchorDistributions:
      'Total ETH distributed as Anchor Distributions to Cosmic Signature NFT anchor-holders.',
    cstTotalTokensImprinted:
      'Total Cosmic Signature NFTs imprinted for wallets that have participated in Cosmic Signature NFT anchoring.',
    cstTotalTokensAnchored: 'Number of Cosmic Signature NFTs currently anchored in the protocol.',
    cstUnretrievedAnchorDistributions:
      'Anchor Distributions allocated but not yet retrieved by Cosmic Signature NFT anchor-holders.',
    rwlkActiveAnchorHolders: 'Wallets currently anchoring at least one RandomWalk NFT.',
    rwlkTotalTokensImprinted:
      'Total Cosmic Signature NFT allocation tokens imprinted for RandomWalk NFT anchor-holders through Anchored-NFT Stellar Selection.',
    rwlkTotalTokensAnchored: 'Number of RandomWalk NFTs currently anchored in the protocol.',
    cstGroup:
      'Cosmic Signature NFT anchoring shares ETH Anchor Distributions among currently anchored Cosmic Signature NFTs.',
    rwlkGroup:
      'RandomWalk NFT anchoring provides eligibility for Anchored-NFT Stellar Selection allocations.',
  },
  tables: {
    participantAddress: 'Wallet address that made at least one indexed gesture.',
    numberOfGestures: 'Total indexed gestures made by this wallet.',
    maxGestureEth: 'Largest single ETH-denominated gesture recorded for this wallet.',
    recipientAddress: 'Wallet address that received one or more indexed protocol allocations.',
    allocationsReceived: 'Number of indexed allocations received by this wallet.',
    maxAllocationEth: 'Largest ETH allocation indexed for this recipient.',
    allocationsSumEth: 'Total ETH allocations indexed for this recipient.',
    contributorAddress: 'Wallet address that contributed ETH to the protocol.',
    numberOfContributions: 'Number of indexed ETH contribution transactions from this wallet.',
    totalContributedEth: 'Total ETH contributed by this wallet.',
    ownerAddress: 'Wallet address currently holding the token balance shown in this row.',
    numberOfTokensOwned: 'Number of Cosmic Signature NFT ERC-721 tokens held by this wallet.',
    cstBalance: 'Current CST ERC-20 balance for this wallet.',
    anchorHolderAddress: 'Wallet address that anchored or released tokens.',
    numAnchorActions: 'Number of indexed anchor transactions made by this wallet.',
    numReleaseActions: 'Number of indexed release transactions made by this wallet.',
    totalImprintedTokens:
      'Total tokens imprinted for this anchor-holder through the relevant anchoring or allocation flow.',
    totalAnchoredTokens: 'Current or cumulative anchored-token count reported for this wallet.',
    totalDistributionEth: 'Total ETH Anchor Distribution indexed for this wallet.',
    unretrievedDistributionEth:
      'ETH Anchor Distribution still available for this wallet to retrieve.',
    systemRound: 'Cycle or deployment context for this system event.',
    systemStarted: 'Timestamp when this system event became active.',
    systemEnded: 'Timestamp when the next system event replaced this one.',
    attachedNftContractAddress: 'ERC-721 contract address for tokens attached to gestures.',
    attachedNftCount: 'Number of NFTs from this contract that have been attached to gestures.',
  },
} as const;
