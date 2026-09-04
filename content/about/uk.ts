import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentUk = {
  metadata: {
    title: 'Про Cosmic Signature | Ончейн-мистецтво на Arbitrum',
    description:
      'Cosmic Signature — процедурний протокол ончейн-мистецтва на Arbitrum, який перетворює жести перформанс-циклу на детерміноване NFT-мистецтво на основі задачі трьох тіл.',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: 'Про Cosmic Signature',
    description:
      'Cosmic Signature — процедурний протокол ончейн-мистецтва на Arbitrum, який генерує детерміноване NFT-мистецтво на основі задачі трьох тіл із жестів перформанс-циклу.',
  },
  breadcrumbLabel: 'Про проєкт',
  eyebrow: 'Про протокол',
  heading: 'Про Cosmic Signature',
  body: {
    paragraphs: [
      'Cosmic Signature — процедурний протокол ончейн-мистецтва на Arbitrum. Під час кожного перформанс-циклу учасники роблять жести в ETH або CST, і кожен жест допомагає сформувати фінальну Сигнатуру: детермінований NFT-твір, згенерований з ончейн-даних за допомогою фізичної симуляції трьох тіл.',
      'Механізми протоколу публічні й доступні для перевірки. Смарт-контракти Arbitrum записують жести, цикли, напрями розподілу, CST, закріплення та закарбування NFT. Твори відтворювані з їхнього сіду, а проєкт наголошує на відкритому коді, мистецтві під CC0 та підтримці суспільних благ.',
      'Cosmic Signature не має стосунку до бази даних онкологічних мутацій COSMIC чи мутаційних сигнатур COSMIC у біології. Це протокол ончейн-мистецтва та застосунок.',
    ],
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature не пропонується як інвестиційний продукт. Протокол описує участь, жести, розподіли, закріплення та перерахування на суспільні блага; він не обіцяє жодної динаміки ціни токена чи фінансових результатів.',
    // lexicon-allow-end
  },
  officialResources: {
    heading: 'Офіційні ресурси',
    links: [
      { id: 'app', label: 'Застосунок Cosmic Signature', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: 'Верифіковані контракти Arbitrum',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: 'Вихідний код', href: ABOUT_RESOURCE_HREFS.code },
      { id: 'x', label: 'X / Twitter', href: ABOUT_RESOURCE_HREFS.x },
      { id: 'discord', label: 'Discord', href: ABOUT_RESOURCE_HREFS.discord },
      { id: 'github', label: 'GitHub', href: ABOUT_RESOURCE_HREFS.github },
      { id: 'faq', label: 'Поширені запитання', href: ABOUT_RESOURCE_HREFS.faq },
      { id: 'terms', label: 'Умови використання', href: ABOUT_RESOURCE_HREFS.terms },
      { id: 'privacy', label: 'Політика конфіденційності', href: ABOUT_RESOURCE_HREFS.privacy },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
