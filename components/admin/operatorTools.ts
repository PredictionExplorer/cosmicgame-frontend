/**
 * The operator tools, in tab order. Each is its own page; the shared
 * `OperatorHeader` links them. Labels live in `admin.tools.<id>`.
 */
export const OPERATOR_TOOLS = [
  { id: 'moderation', href: '/admin' },
  { id: 'settings', href: '/admin/admin' },
  { id: 'outreachTransfer', href: '/internal/cst-outreach-transfer' },
] as const;

export type OperatorToolId = (typeof OPERATOR_TOOLS)[number]['id'];

/**
 * The on-chain roles an operator wallet can hold: the protocol contract's
 * owner (the only account that changes the parameters on Contract settings)
 * and the Outreach Reserve's owner and treasurer (the treasurer alone sends
 * CST from it). Labels live in `admin.wallet.roles.<role>`.
 */
export const OPERATOR_ROLES = ['protocolOwner', 'outreachOwner', 'outreachTreasurer'] as const;

export type OperatorRole = (typeof OPERATOR_ROLES)[number];
