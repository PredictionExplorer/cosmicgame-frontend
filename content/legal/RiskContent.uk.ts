import type { TrustPageCopy } from './TrustPageContent';

/** Ukrainian copy for /risk-disclosures, rendered by TrustPageContent. */
export const riskCopyUk: TrustPageCopy = {
  eyebrow: 'Ризики та ясність для учасників',
  title: 'Розкриття ризиків',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic Signature — це процедурний протокол ончейн-мистецтва на Arbitrum. Це не лотерея, не казино, не продукт азартних ігор, не інвестиційний продукт і не обіцянка фінансових результатів.',
  // lexicon-allow-end
  sections: [
    {
      heading: 'Основні ризики',
      bullets: [
        'Транзакції в блокчейні є публічними та, як правило, незворотними.',
        'Безпека гаманця, приватні ключі та схвалення транзакцій — відповідальність користувача.',
        'Перевантаження мережі, збої RPC, затримки індексатора або проблеми в застосунку можуть впливати на користувацький досвід.',
        'Перед участю слід ознайомитися з параметрами протоколу, розподілами та часовими межами.',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CST і NFT не слід розуміти як гарантований дохід чи фінансові продукти.',
        // lexicon-allow-end
      ],
    },
    {
      heading: 'Що роблять учасники',
      paragraphs: [
        'Учасники роблять жести протягом перформанс-циклів. Жести можуть впливати на стан протоколу, що постійно змінюється, закарбовувати CST участі та формувати контекст детермінованого NFT-мистецтва Cosmic Signature. Результати визначаються публічною механікою смарт-контрактів, а не обіцянками поза блокчейном.',
      ],
    },
    {
      heading: 'Пов’язані сторінки',
      links: [
        // lexicon-allow-start: link label names the categories denied by the linked page.
        {
          kind: 'landing',
          href: '/learn/not-a-lottery-not-an-investment',
          label: 'Чи є Cosmic Signature лотереєю, казино або інвестицією?',
        },
        // lexicon-allow-end
        { kind: 'app', href: '/terms', label: 'Умови використання' },
        { kind: 'app', href: '/security', label: 'Огляд безпеки' },
      ],
    },
  ],
};
