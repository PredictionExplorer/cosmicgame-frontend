/**
 * The coined vocabulary with a definition in `messages/<locale>/glossary.json`
 * (`terms.<id>.term`, `.short`, `.long`).
 *
 * One definition per term, shared by every surface that explains it: the
 * FAQ, figure labels, the standings and the how-it-works page all read the
 * same copy, so the protocol is described one way everywhere.
 *
 * Server-safe on purpose (no 'use client', no hooks). A server component
 * maps over the ids to render a glossary section with
 * `getTranslations('glossary')`; `<Term id>` (components/ui/term) is the
 * client island for one word in a sentence. Exporting the list from a client
 * module would hand server components a client-reference proxy instead of an
 * array.
 */
export const GLOSSARY_TERM_IDS = [
  'gesture',
  'cycle',
  'cycleFinalizationTime',
  'calibrationWindow',
  'cycleReserve',
  'signatureAllocation',
  'finalCstGesture',
  'enduranceChampion',
  'chronoWarrior',
  'stellarSelection',
  'anchoring',
  'anchorDistribution',
  'retrieve',
  'imprint',
  'publicGoods',
  'outreachReserve',
  'cosmicCouncil',
  'cst',
] as const;

export type GlossaryTermId = (typeof GLOSSARY_TERM_IDS)[number];
