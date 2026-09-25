import { protocolFacts } from '@/content/protocol-facts';

import { copyNumbers } from './copyNumbers';
import type { HowItWorksText } from './structure';

const numbers = copyNumbers('uk');
const cst = numbers.specialAllocationCst;
const { ethRecipients, nftRecipients, anchoredRecipients } = numbers;
/** "3 записи", "10 записів": the count with the noun that agrees with it. */
const entries = (count: number) =>
  `${numbers.count(count)} ${numbers.plural(count, { one: 'запис', few: 'записи', many: 'записів', other: 'запису' })}`;
/** "3 отримувачі", "10 отримувачів". */
const recipients = (count: number) =>
  `${numbers.count(count)} ${numbers.plural(count, { one: 'отримувач', few: 'отримувачі', many: 'отримувачів', other: 'отримувача' })}`;

/** Ukrainian how-it-works copy, keyed by the skeleton in structure.ts. */
export const howItWorksTextUk = {
  metadata: {
    title: 'Як працює Cosmic Signature | Перформанс-цикли, жести та NFT',
    description:
      'Дізнайтеся, як розгортається перформанс-цикл Cosmic Signature — від вікна калібрування через жести до фінального розподілу.',
  },
  jsonLd: {
    name: 'Як працює Cosmic Signature',
    description:
      'Дізнайтеся, як розгортається перформанс-цикл Cosmic Signature — від вікна калібрування через жести до фінального розподілу.',
  },
  breadcrumbs: {
    homeLabel: 'Головна',
    pageLabel: 'Як це працює',
  },
  hero: {
    heading: 'Як працює Cosmic Signature',
    paragraph:
      'Жест за жестом учасники формують Сигнатуру протягом перформанс-циклу. Коли відлік дійде до нуля, цикл можна завершити. Тоді протокол виконає розподіли за понад десятьма напрямами, серед яких розподіл Сигнатури, надходження за закріплення та підтримка Protocol Guild.',
    primaryCtaLabel: 'Зробити жест',
    secondaryCtaLabel: 'Переглянути поточний цикл',
  },
  rewardBreakdown: {
    heading: 'Що дає кожен жест',
    subhead: 'Кожен жест бере участь у кількох напрямах розподілу свого циклу.',
    items: [
      {
        title: 'Динамічні CST участі',
        description:
          'Жест може закарбувати CST. Кількість залежить від квадратного кореня з часу, що минув від попереднього жесту: жест одразу після іншого може дати 0 CST, а довша пауза дає більше.',
      },
      {
        title: 'Запис у зоряному відборі',
        description: `Кожен жест додає один запис. Коли цикл завершується, випадково відбирають ${entries(ethRecipients)}, ${numbers.plural(ethRecipients, { one: 'який ділить', other: 'які ділять' })} ${protocolFacts.stellarSelectionEthPercentage}% резерву циклу в ETH.`,
      },
      {
        title: 'Відбір Cosmic Signature NFT',
        description: `Ще ${entries(nftRecipients)} ${numbers.plural(nftRecipients, { one: 'отримує', other: 'отримують' })} по ${cst} CST і по одному Cosmic Signature NFT. Одну адресу можуть відібрати кілька разів, і жодна кількість записів не гарантує відбору.`,
      },
      {
        title: 'Розподіл Сигнатури',
        description: `Учасник, який зробив завершальний жест, може завершити цикл і забрати ${protocolFacts.mainEthPercentage}% резерву циклу в ETH, ${cst} CST і Cosmic Signature NFT.`,
      },
    ],
  },
  costs: {
    heading: 'Скільки коштує жест',
    subhead: 'Перш ніж платити за жест в ETH чи CST, врахуйте ось що.',
    items: [
      {
        title: 'Витрачене не повертається',
        body: 'ETH, сплачені за жест, надходять до резерву циклу, а сплачені CST спалюються. Ні те, ні інше не повертається, коли хтось робить жест після вас.',
      },
      {
        title: 'Вартість ETH-жесту зростає',
        body: `Кожен ETH-жест підвищує вартість наступного ETH-жесту на ${protocolFacts.ethGestureCostStepUpPercent}%. Знижується вона лише у вікні калібрування ETH на початку кожного циклу.`,
      },
      {
        title: 'Газ оплачується окремо',
        body: 'Кожен жест є транзакцією в Arbitrum, тож ви також сплачуєте мережеву комісію в ETH. Гаманець показує її перед підтвердженням.',
      },
    ],
    note: 'Робіть жести лише коштами, втрату яких можете собі дозволити.',
    riskLinkLabel: 'Прочитати розкриття ризиків',
  },
  gameCycle: {
    heading: 'Етапи перформанс-циклу',
    subhead: 'Кожен цикл проходить цю послідовність від відкриття до завершення.',
    legend: {
      gestures: 'Жести',
      finalization: 'Завершення',
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours} годин, коли завершити цикл може лише учасник із завершальним жестом`,
      allocations: 'Напрями розподілу',
    },
    phases: [
      {
        label: 'Цикл відкривається',
        description: `Починається новий перформанс-цикл. Вартість жестів в ETH і CST знижується кожна у своєму вікні калібрування; вікно калібрування CST починається з орієнтиру в ${protocolFacts.initialCstCalibrationWindowHours} годин, який далі змінюється разом з участю. Резерв циклу починається з того, що переніс попередній цикл.`,
      },
      {
        label: 'Учасники роблять жести',
        description: `Кожен жест додає поточний приріст часу до часу завершення циклу. ETH-жест скорочує вікно калібрування CST приблизно на ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%, а CST-жест подовжує його приблизно на ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%.`,
      },
      {
        label: 'Відлік до завершення циклу спливає',
        description: `Коли відлік доходить до нуля, учасник, який зробив завершальний жест, має ${protocolFacts.finalGestureExclusivityHours} годин, щоб завершити цикл. Після цього завершити його може будь-хто, і саме той, хто завершить, отримує розподіл Сигнатури. Доки завершення не виконано, новий жест подовжує відлік і стає завершальним.`,
      },
      {
        label: 'Цикл завершується',
        description: `Завершення виконує всі розподіли. Учасник, який завершує цикл, отримує розподіл Сигнатури: ${protocolFacts.mainEthPercentage}% резерву циклу, ${cst} CST і Cosmic Signature NFT.`,
      },
      {
        label: 'Зоряні відбори',
        description: `${recipients(ethRecipients)} зоряного відбору ETH ${numbers.plural(ethRecipients, { one: 'ділить', other: 'ділять' })} ${protocolFacts.stellarSelectionEthPercentage}% резерву циклу. ${recipients(nftRecipients)} зоряного відбору NFT і ${recipients(anchoredRecipients)} зоряного відбору закріплених NFT, відібраних серед закріплених Random Walk NFT, отримують по ${cst} CST і по одному Cosmic Signature NFT. Запис додається за кожен жест, а відбори ETH і NFT відбуваються з усіх записів циклу з повторенням.`,
      },
      {
        label: 'Наступний цикл',
        description: `Решта ${protocolFacts.compoundingReservePercentage}% резерву циклу переходить далі як накопичувальний резерв, і наступний цикл починається з новими вікнами калібрування.`,
      },
    ],
  },
  payoff: {
    heading: 'Кожен цикл завершується Сигнатурою',
    body: `Кожен жест формує твір циклу. Коли цикл завершується, його Сигнатуру закарбовують як Cosmic Signature NFT, і разом із розподілом Сигнатури вона дістається тому, хто завершить цикл. Перші ${protocolFacts.finalGestureExclusivityHours} годин після того, як відлік дійде до нуля, це може зробити лише учасник, який зробив завершальний жест; потім — будь-хто.`,
    linkLabel: 'Переглянути цю Сигнатуру',
  },
  stepByStep: {
    heading: 'Перші кроки',
    subhead: 'Від під’єднання гаманця до першого жесту за три кроки.',
    stepLabel: 'Крок {n}',
    steps: [
      {
        title: 'Під’єднайте гаманець',
        highlights: [
          'Натисніть кнопку під’єднання в правому верхньому куті сторінки.',
          'Використовуйте гаманець із підтримкою Arbitrum, наприклад MetaMask. Arbitrum є мережею другого рівня (Layer 2) на Ethereum з нижчими комісіями та швидшими транзакціями.',
          'Коли гаманець попросить, перемкніть мережу на Arbitrum і підтвердьте під’єднання.',
          'Після під’єднання адреса вашого гаманця з’явиться в шапці сторінки.',
        ],
      },
      {
        title: 'Перевірте вартість жесту',
        highlights: [
          'Перш ніж підтверджувати, перевірте поточну вартість жесту в ETH або CST.',
          'Перегляньте розрахунок CST участі: кількість змінюється залежно від часу після попереднього жесту.',
          'Переконайтеся, що на гаманці є вартість жесту і трохи ETH на мережеву комісію; гаманець показує її перед підтвердженням.',
        ],
      },
      {
        title: 'Зробіть жест',
        highlights: [
          `Оберіть ETH або CST. До ETH-жесту можна долучити Random Walk NFT, щоб знизити вартість ETH-жесту на ${protocolFacts.randomWalkDiscountPercentage}%, один раз для кожного NFT.`,
          'Натисніть кнопку жесту, на якій указано спосіб і вартість (наприклад, «Зробити ETH-жест»), і підтвердьте транзакцію в гаманці.',
        ],
      },
    ],
    fundingText: 'Ще не маєте ETH в Arbitrum?',
    fundingLinkLabel: 'Як отримати ETH у мережі Arbitrum',
  },
  proTips: {
    heading: 'Варто знати',
    subhead: 'Деталі, які легко пропустити.',
    tips: [
      {
        title: 'Два вікна калібрування',
        body: `Вартість ETH-жесту знижується у вікні калібрування лише раз, на початку кожного циклу. Для CST-жестів нове вікно починається після кожного CST-жесту: від подвоєної щойно сплаченої вартості (щонайменше ${protocolFacts.cstCalibrationCeilingMinCst} CST) до нуля.`,
      },
      {
        title: 'Кожен Random Walk NFT діє один раз',
        body: `Random Walk NFT знижує вартість одного ETH-жесту на ${protocolFacts.randomWalkDiscountPercentage}% і після цього вже не знижує вартість інших. Використання не впливає на закріплення.`,
      },
      {
        title: 'Використовуйте окремий гаманець',
        body: 'Окремий гаманець відокремлює вашу активність у протоколі від основних активів. Що перевірено й верифіковано, показано на сторінці «Аудити».',
      },
    ],
  },
  callToAction: {
    heading: 'Готові зробити перший жест?',
    body: 'Під’єднайте гаманець і зробіть жест у поточному перформанс-циклі, щоб долучитися до створення Сигнатури та мати змогу закарбувати CST участі.',
    primaryCtaLabel: 'Зробити жест',
    faqCtaLabel: 'Переглянути поширені запитання',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X (Twitter)',
  },
} satisfies HowItWorksText;
