import type { TerminologyRule } from '../terminology-consistency-core';

/**
 * Canonical Ukrainian terminology (docs/i18n/glossary-uk.md).
 *
 * Variants are word-initial STEMS matched with Unicode boundaries (see
 * `unicode-stem` in locale-text-matchers.ts), so one entry covers every
 * inflected form: `одержувач` also catches одержувача, одержувачем, …
 * Multi-word variants are matched as a phrase prefix.
 *
 * Keep this list focused on terminology drift. Vocabulary that is banned
 * outright (аукціон, ставка, лотерея, стейкінг, благодійність, …) lives only in
 * UK_BANNED_STEMS / UK_BANNED_TERMS in lexicon-scan-core.ts so neither gate
 * can silently weaken the other.
 */
export const UK_TERMINOLOGY_RULES: readonly TerminologyRule[] = [
  {
    concept: 'Gesture',
    canonical: 'жест',
    variants: ['заявк', 'жестикуляц'],
  },
  {
    concept: 'Gesture Cost',
    canonical: 'вартість жесту',
    variants: ['ціна жесту', 'кошт жесту'],
  },
  {
    concept: 'Performance Cycle',
    canonical: 'перформанс-цикл (у щільному інтерфейсі — «цикл»)',
    // Phrase variants are listed in every case of «цикл» because the stem
    // matcher anchors on the first word (циклу виконання must be caught too).
    variants: [
      ...[
        'цикл',
        'циклу',
        'циклом',
        'циклі',
        'цикли',
        'циклів',
        'циклам',
        'циклами',
        'циклах',
      ].flatMap((form) => [
        `${form} продуктивност`,
        `${form} вистав`,
        `${form} виступ`,
        `${form} виконанн`,
        `${form} представленн`,
      ]),
      'перфоманс',
    ],
  },
  {
    concept: 'Finalize / Finalization',
    canonical: 'завершити / завершення',
    variants: ['фіналізац', 'фіналізу'],
  },
  {
    concept: 'Final Gesture',
    canonical: 'завершальний жест',
    variants: ['фінальний жест', 'заключний жест'],
  },
  {
    concept: 'Calibration Window',
    canonical: 'вікно калібрування',
    variants: ['калібрувальне вікно', 'вікно калібровки', 'вікно калібраці'],
  },
  {
    concept: 'Allocation',
    canonical: 'розподіл',
    variants: ['алокац', 'асигнуван'],
  },
  {
    concept: 'Allocation Recipient',
    canonical: 'отримувач',
    variants: ['одержувач', 'реципієнт'],
  },
  {
    concept: 'Stellar Selection',
    canonical: 'зоряний відбір',
    variants: ['зірковий відбір', 'зоряний вибір', 'зоряна вибірк', 'стелар'],
  },
  {
    concept: 'Anchoring / release',
    canonical: 'закріплення / відкріпити',
    variants: ['анкер', 'якорін', 'якорюван', 'заякор', 'розкріпи', 'розкріплен'],
  },
  {
    concept: 'Anchor Distribution',
    canonical: 'надходження за закріплення',
    variants: ['дистрибуц', 'виплата за закріплення', 'виплати за закріплення'],
  },
  {
    concept: 'Imprint',
    canonical: 'закарбувати / закарбування',
    variants: ['відбиток', 'відтиск', 'карбуванн', 'карбувати'],
  },
  {
    concept: 'Cosmic Council',
    canonical: 'Космічна Рада',
    variants: ['космічна асамбле', 'космічний парламент', 'космічний совєт'],
  },
  {
    concept: 'Public Goods',
    canonical: 'суспільні блага',
    variants: ['громадські блага', 'публічні блага', 'загальні блага'],
  },
  {
    concept: 'Outreach Reserve',
    canonical: 'резерв просування',
    variants: ['резерв поширенн', 'резерв аутрич', 'резерв охопленн'],
  },
  {
    concept: 'Compounding Cycle Reserve',
    canonical: 'накопичувальний резерв',
    variants: ['складний резерв', 'компаундинг', 'резерв, що переходить'],
  },
  {
    concept: 'Gallery',
    canonical: 'галерея',
    variants: ['галері'],
  },
  {
    concept: 'Learn Hub',
    canonical: 'навчальний центр',
    variants: ['освітній хаб', 'навчальний хаб', 'хаб знань'],
  },
  {
    concept: 'Site Map',
    canonical: 'мапа сайту',
    variants: ['карта сайту'],
  },
  {
    concept: 'White Paper',
    canonical: 'біла книга',
    variants: ['вайтпейпер', 'вайт пейпер', 'вайт-пейпер'],
  },
  {
    concept: 'Participation CST',
    canonical: 'CST участі',
    variants: ['CST за участь', 'участь CST'],
  },
  {
    concept: 'Recognition CST',
    canonical: 'CST визнання',
    variants: ['CST за визнання', 'визнання CST'],
  },
  {
    concept: 'Attached NFTs',
    canonical: 'долучені NFT / долучити',
    variants: ['прикріпл', 'приєднан'],
  },
  {
    concept: 'Named Tokens',
    canonical: 'іменовані токени / дати ім’я',
    variants: ['названі токени', 'найменован'],
  },
  {
    concept: 'Retrieve',
    canonical: 'забрати',
    // The banned phrases (вивести кошти, зняти кошти, кешаут) live in the
    // lexicon scanner; this rule catches the bare verb drift only.
    variants: ['вивести', 'виведіть'],
  },
  {
    concept: 'Finalization countdown',
    canonical: 'відлік до завершення',
    variants: ['відлік до фіналу', 'відлік до фіналізації'],
  },
  {
    concept: 'Knowledge quiz',
    canonical: 'тест знань',
    variants: ['вікторин', 'квіз'],
  },
] as const;
