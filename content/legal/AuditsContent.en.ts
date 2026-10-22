import type { AuditsCopy } from './AuditsContent';

/** English copy for /audits, rendered by AuditsContent. */
export const auditsCopyEn: AuditsCopy = {
  title: 'Audits',
  intro:
    'Hacken’s historical contract review, repository verification tools, and how to inspect the current deployment. The historical audit is not an independent review of every later V2 or V3 change.',
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
    repositoryCta: 'Browse the contracts repository',
  },
  audit: {
    heading: 'Independent audit by Hacken',
    paragraphs: [
      'Hacken reviewed the Cosmic Signature contracts in late 2025 at revision 9385ddb and published its final report in January 2026. Its scope included the core protocol, token and NFT integrations, anchoring wallets and supporting contracts at that revision. V3 was installed later and is not automatically covered by that review.',
      'The report lists each finding with its severity and its status; the summary above counts them. None is critical or high severity, and most describe design tradeoffs the team reviewed and accepted.',
      'Alongside the manual review, Hacken fuzz-tested the system’s invariants, properties such as the rule that the ETH the protocol holds always equals what came in minus what went out. Every invariant held.',
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
      'Open the address on <explorer>Arbiscan</explorer>, confirm Arbitrum One, and inspect the current implementation and its actual source-verification status.',
      'Compare published source with the <contractsRepository>repository</contractsRepository> and inspect <sourcify>Sourcify</sourcify>. V3 currently has no Sourcify verification; historical implementation matches do not transfer to it.',
      'Read the <hacken>Hacken report</hacken> for every finding and its status.',
      'Confirm that what the app shows matches the contract’s behavior on-chain.',
    ],
  },
};
