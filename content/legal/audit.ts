import { HACKEN_REPORT_URL } from './links';

/**
 * The Hacken audit of the Cosmic Signature contracts, as the published report
 * states it. The /audits summary and the copy in every locale read these
 * figures from here, so a correction is made once.
 */
export const HACKEN_AUDIT = {
  auditor: 'Hacken',
  /** The month the final report was published (`YYYY-MM`). */
  reportPublished: '2026-01',
  reportUrl: HACKEN_REPORT_URL,
  findings: {
    critical: 0,
    high: 0,
    medium: 3,
    low: 8,
    informational: 12,
  },
  invariants: {
    tested: 14,
    held: 14,
    runs: 10_000,
  },
} as const;

export type AuditSeverity = keyof typeof HACKEN_AUDIT.findings;

/** Severities in the report's order, most severe first. */
export const AUDIT_SEVERITIES: readonly AuditSeverity[] = [
  'critical',
  'high',
  'medium',
  'low',
  'informational',
];

export const AUDIT_FINDINGS_TOTAL = AUDIT_SEVERITIES.reduce(
  (total, severity) => total + HACKEN_AUDIT.findings[severity],
  0,
);

/**
 * Formal verification and automated analysis the contracts repository
 * carries (checked 2026-09-24 against the default branch): Certora Prover
 * specifications, the Solidity SMTChecker configuration, Slither static
 * analysis and the test suite. Each id is a `LEGAL_LINKS` entry.
 */
export const REPOSITORY_ANALYSIS = ['certora', 'smtchecker', 'slither', 'tests'] as const;
