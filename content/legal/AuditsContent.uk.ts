import { formatCount } from '@/utils/format';

import { AUDIT_FINDINGS_TOTAL, HACKEN_AUDIT } from './audit';
import type { AuditsCopy } from './AuditsContent';

const { findings, invariants } = HACKEN_AUDIT;
const count = (value: number) => formatCount(value, 'uk');

/** Ukrainian copy for /audits, rendered by AuditsContent. */
export const auditsCopyUk: AuditsCopy = {
  title: 'Аудити',
  intro:
    'Незалежний аудит контрактів Cosmic Signature від Hacken, формальна верифікація та аналіз у репозиторії контрактів і те, як перевірити контракт самостійно.',
  summary: {
    label: 'Аудит коротко',
    auditor: 'Аудитор',
    published: 'Звіт опубліковано',
    findings: 'Зауваження',
    criticalOrHigh: 'Критичні чи високі',
    invariants: 'Інваріанти витримано',
    invariantsValue: '{held} з {tested}',
    runs: 'Запусків фазингу',
    severity: 'Зауваження за рівнем серйозності',
    severities: {
      critical: 'Критичні',
      high: 'Високі',
      medium: 'Середні',
      low: 'Низькі',
      informational: 'Інформаційні',
    },
    reportCta: 'Прочитати звіт Hacken',
    repositoryCta: 'Переглянути перевірені контракти',
  },
  audit: {
    heading: 'Незалежний аудит від Hacken',
    paragraphs: [
      `Наприкінці 2025 року Hacken провела незалежну перевірку безпеки смарт-контрактів Cosmic Signature. Перевірка охопила робочі контракти в публічному репозиторії — від ядра протоколу, яке керує кожним циклом, до токена CST, обох колекцій NFT, гаманців закріплення та допоміжних контрактів керування гаманцями й системою. Підсумковий звіт Hacken опублікувала в січні 2026 року.`,
      `У звіті наведено ${count(AUDIT_FINDINGS_TOTAL)} зауваження, серед яких немає жодного критичного чи високого рівня серйозності: ${count(findings.medium)} середнього рівня, ${count(findings.low)} низького та ${count(findings.informational)} інформаційних спостережень. Більшість із них описують архітектурні компроміси, які команда розглянула та прийняла; звіт пояснює кожне зауваження разом із його статусом.`,
      `Окрім ручної перевірки, Hacken провела фазинг-тестування ${count(invariants.tested)} інваріантів системи — властивостей на кшталт вимоги, щоб обсяг ETH, який утримує протокол, завжди дорівнював сумі депозитів за вирахуванням забраних коштів. Усі ${count(invariants.held)} інваріантів витримали ${count(invariants.runs)} запусків.`,
    ],
  },
  analysis: {
    heading: 'Формальна верифікація та аналіз',
    paragraphs: [
      'Репозиторій контрактів також містить перевірки, які команда запускає сама: специфікації Certora Prover для логіки протоколу, збереження ETH, контролю доступу й контрактів гаманців, конфігурацію Solidity SMTChecker, статичний аналіз Slither і автоматизовані тести.',
      'Ці перевірки доводять або тестують лише ті властивості, які в них сформульовано. Як і аудит, вони зменшують ризик, але не усувають його; див. <risk>розкриття ризиків</risk>.',
    ],
    resources: [
      {
        link: 'certora',
        label: 'Специфікації Certora',
        description: 'Властивості, які перевіряє Certora Prover, і конфігурація кожного запуску',
      },
      {
        link: 'smtchecker',
        label: 'Конфігурація SMTChecker',
        description: 'Скрипти, що компілюють контракти з увімкненою перевіркою моделей Solidity',
      },
      {
        link: 'slither',
        label: 'Аналіз Slither',
        description: 'Статичний аналіз і перевірки можливості оновлення з поясненнями щодо запуску',
      },
      {
        link: 'tests',
        label: 'Тести',
        description: 'Автоматизовані тести контрактів',
      },
    ],
  },
  checklist: {
    heading: 'Контрольний список верифікації',
    intro: 'Перш ніж взаємодіяти з контрактом, ви можете самостійно перевірити таке:',
    steps: [
      'Знайдіть адресу контракту на <contracts>сторінці контрактів</contracts> — єдиному списку офіційних адрес.',
      'Відкрийте адресу в <explorer>Arbiscan</explorer> і переконайтеся, що вона в Arbitrum One і має верифікований вихідний код.',
      'Порівняйте цей код із <contractsRepository>публічним репозиторієм</contractsRepository> або перевірте точний збіг на <sourcify>Sourcify</sourcify>.',
      'Прочитайте <hacken>звіт Hacken</hacken>, щоб побачити кожне зауваження та його статус.',
      'Переконайтеся, що те, що показує застосунок, відповідає поведінці контракту в блокчейні.',
    ],
  },
};
