import { WHITE_PAPER_SHARED } from '@/content/white-paper/structure';

import { ABOUT_PATH, ABOUT_RESOURCE_HREFS, type AboutContent } from './types';

export const aboutContentUk = {
  metadata: {
    title: 'Про Cosmic Signature | Ончейн-мистецтво на Arbitrum',
    description:
      'Cosmic Signature — процедурний протокол ончейн-мистецтва на Arbitrum, який перетворює жести перформанс-циклу на детерміноване NFT-мистецтво на основі задачі трьох тіл.',
    path: ABOUT_PATH,
  },
  jsonLd: {
    name: 'Про Cosmic Signature',
    description:
      'Cosmic Signature — процедурний протокол ончейн-мистецтва на Arbitrum, який генерує детерміноване NFT-мистецтво на основі задачі трьох тіл із жестів перформанс-циклу.',
  },
  breadcrumbLabel: 'Про проєкт',
  eyebrow: 'Про Cosmic Signature',
  heading: 'Мистецтво, яке може відтворити кожен, — від сіда до Сигнатури',
  body: {
    lede: 'Cosmic Signature — процедурний протокол ончейн-мистецтва на Arbitrum. Під час кожного перформанс-циклу учасники роблять жести в ETH або CST, і кожен жест допомагає сформувати фінальну Сигнатуру: детермінований NFT-твір, згенерований з ончейн-даних за допомогою фізичної симуляції трьох тіл.',
    // lexicon-allow-start: explicit investment-product denial for crawler and compliance clarity.
    denial:
      'Cosmic Signature не пропонується як інвестиційний продукт. Протокол описує участь, жести, розподіли, закріплення та перерахування на суспільні блага; він не обіцяє жодної динаміки ціни токена чи фінансових результатів.',
    // lexicon-allow-end
  },
  facts: {
    licenseLabel: 'Ліцензія',
    license: 'CC0 для мистецтва й коду',
    networkLabel: 'Мережа',
    network: 'Arbitrum One',
    publicGoodsLabel: 'Суспільні блага',
    publicGoodsTemplate: '{percent} кожного резерву циклу',
  },
  origin: {
    heading: 'Походження',
    paragraphs: [
      `Cosmic Signature спроєктував ${WHITE_PAPER_SHARED.authorName}, автор і Білої книги протоколу. Проєкт виріс із двох переконань: генеративне мистецтво найцікавіше тоді, коли в ньому немає нічого довільного і кожне зображення — результат фізичного процесу, який будь-хто може повторити з того самого сіда; а протокол, що тримає ETH учасників, має чітко відповідати, куди йде кожен wei.`,
      'Власник зберігає повноваження змінювати параметри й реалізацію за умовами контрактів. Основні зміни обмежені неактивним циклом, але існують окремі повноваження щодо активації, наступної затримки та периферійних контрактів. V3 не передає контроль Космічній Раді автоматично і не містить автоматичної відмови від повноважень.',
    ],
  },
  milestones: {
    heading: 'Від запуску до передачі',
    items: {
      v1: {
        label: 'V1',
        status: 'Запущено',
        text: 'Протокол запущено в Arbitrum One за оновлюваним проксі: цикли, жести, напрями розподілу, закріплення, Космічна Рада й конвеєр мистецтва.',
      },
      v2: {
        label: 'V2',
        status: 'Історична версія',
        text: 'Версія V2 тепер історична; її замінила V3.',
      },
      v3: {
        label: 'V3',
        status: 'Розгорнуто',
        text: 'V3 уже розгорнуто. Він змінює формулу й отримувача CST участі, вагу обох зоряних відборів серед учасників, швидкість зниження CST-вартості, частки ETH і кількість NFT розподілу Сигнатури, а також додає пізню надбавку.',
      },
      handover: {
        label: 'Далі',
        status: 'Не виконано автоматично',
        text: 'Власник зберігає повноваження змінювати параметри й реалізацію за умовами контрактів. Основні зміни обмежені неактивним циклом, але існують окремі повноваження щодо активації, наступної затримки та периферійних контрактів. V3 не передає контроль Космічній Раді автоматично і не містить автоматичної відмови від повноважень.',
      },
    },
  },
  clarificationsHeading: 'Уточнення',
  officialResources: {
    heading: 'Офіційні ресурси',
    links: [
      { id: 'app', label: 'Застосунок Cosmic Signature', href: ABOUT_RESOURCE_HREFS.app },
      {
        id: 'contracts',
        label: 'Контракти в Arbitrum',
        href: ABOUT_RESOURCE_HREFS.contracts,
      },
      { id: 'code', label: 'Вихідний код', href: ABOUT_RESOURCE_HREFS.code },
      {
        id: 'support',
        label: 'support@cosmicsignature.com',
        href: ABOUT_RESOURCE_HREFS.support,
      },
    ],
  },
} as const satisfies AboutContent;
