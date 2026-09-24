import type { AuditsCopy } from './AuditsContent';

/** English copy for /audits, rendered by AuditsContent. */
export const auditsCopyEn: AuditsCopy = {
  title: 'Audits',
  intro:
    'An independent audit of the Cosmic Signature contracts by Hacken, the formal verification and analysis kept in the contracts repository, and how to check a contract yourself.',
  summary: {
    label: 'Audit at a glance',
    auditor: 'Auditor',
    published: 'Report published',
    findings: 'Findings',
    criticalOrHigh: 'Critical or high',
    invariants: 'Invariants held',
    invariantsValue: '{held} of {tested}',
    runs: 'Fuzzing runs',
    severity: 'Findings by severity',
    severities: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      informational: 'Informational',
    },
    reportCta: 'Read the Hacken report',
    repositoryCta: 'Browse the audited contracts',
  },
  audit: {
    heading: 'Independent audit by Hacken',
    paragraphs: [
      'In late 2025, Hacken carried out an independent security review of the Cosmic Signature smart contracts. The engagement covered the production contracts in the public repository: the core protocol that runs each cycle, the CST token, both NFT collections, the anchoring wallets, and the wallet and system management contracts that support them. Hacken published the final report in January 2026.',
      'The report lists each finding with its severity and its status; the summary above counts them. None is critical or high severity, and most describe design tradeoffs the team reviewed and accepted.',
      'Alongside the manual review, Hacken fuzz-tested the system’s invariants, properties such as the rule that the ETH the protocol holds always equals deposits minus withdrawals. Every invariant held.',
    ],
  },
  analysis: {
    heading: 'Formal verification and analysis',
    paragraphs: [
      'The contracts repository also carries the checks the team runs itself: Certora Prover specifications for the protocol logic, ETH conservation, access control and the wallet contracts; a Solidity SMTChecker configuration; Slither static analysis; and an automated test suite.',
      'These checks prove or test the properties they state, and no more. Like the audit, they reduce risk without removing it; see the <risk>risk disclosures</risk>.',
    ],
    resources: [
      {
        link: 'certora',
        label: 'Certora specifications',
        description: 'The properties the Certora Prover checks, with the configuration of each run',
      },
      {
        link: 'smtchecker',
        label: 'SMTChecker configuration',
        description: 'Scripts that compile the contracts with the Solidity model checker enabled',
      },
      {
        link: 'slither',
        label: 'Slither analysis',
        description: 'Static analysis and upgradeability checks, with notes on running them',
      },
      {
        link: 'tests',
        label: 'Test suite',
        description: 'The contracts’ automated tests',
      },
    ],
  },
  checklist: {
    heading: 'Verification checklist',
    intro: 'Before you interact with a contract, you can confirm each of these yourself:',
    steps: [
      'Find the contract’s address on the <contracts>contracts page</contracts>, the one list of official addresses.',
      'Open the address on <explorer>Arbiscan</explorer> and confirm it is on Arbitrum One with verified source code.',
      'Compare that source with the <contractsRepository>public repository</contractsRepository>, or check the exact match on <sourcify>Sourcify</sourcify>.',
      'Read the <hacken>Hacken report</hacken> for every finding and its status.',
      'Confirm that what the app shows matches the contract’s behavior on-chain.',
    ],
  },
};
