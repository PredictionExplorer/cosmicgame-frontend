import type { QuizText } from './structure';
import { basicQuestionsTextUk } from './text.basic.uk';
import { hardQuestionsTextUk } from './text.hard.uk';
import { mediumQuestionsTextUk } from './text.medium.uk';

/** Українські тексти тесту знань; ключі — за скелетом у structure.ts. */
export const quizTextUk = {
  hub: {
    eyebrow: 'Тест знань',
    h1: 'Наскільки добре ви знаєте Cosmic Signature?',
    intro:
      'Сто запитань трьох рівнів за Білою книгою: цикли, жести, розподіли, створення мистецтва та особливі випадки. Кожна відповідь має пояснення й посилання на відповідний розділ, щоб ви могли дізнатися більше.',
    breadcrumbs: {
      ariaLabel: 'Навігаційний ланцюжок',
      homeLabel: 'Головна',
      quizLabel: 'Тест знань',
    },
    questionCountTemplate: '{count} запитань',
    durationTemplate: 'Близько {minutes} хв',
    difficultyTemplate: 'Складність {level} з {max}',
    bestTemplate: 'Найкраще: {correct} з {total}',
    inProgressTemplate: 'Триває: запитання {current} з {total}',
    startLabel: 'Почати',
    resumeLabel: 'Продовжити',
  },
  ui: {
    intro: {
      keyboardHint: 'Підказка: натискайте 1–4, щоб відповісти, та Enter, щоб продовжити.',
      beginLabel: 'Розпочати',
      resumeLabel: 'Продовжити',
      startOverLabel: 'Почати спочатку',
      ranksHeading: 'Рівні',
      rankFromTemplate: 'Від {percent}',
      rankBelowTemplate: 'Менше {percent}',
    },
    progressTemplate: 'Запитання {current} з {total}',
    correctFeedback: [
      'Правильно.',
      'Саме так. Пояснення — нижче.',
      'Ви обрали правильну відповідь.',
      'Це відповідає правилам протоколу.',
    ],
    incorrectFeedback: [
      'Не зовсім. Пояснення — нижче.',
      'Ця відповідь не відповідає правилам протоколу.',
      'Порівняйте відповідь із правилом нижче.',
      'Перегляньте пояснення та відповідний розділ Білої книги.',
    ],
    correctAnswerTemplate: 'Правильна відповідь — {letter}.',
    yourAnswerLabel: 'Ваша відповідь',
    correctAnswerLabel: 'Правильна відповідь',
    newTabNote: '(відкривається в новій вкладці)',
    streakTemplate: 'Серія: {count} поспіль',
    explanationHeading: 'Чому',
    funFactHeading: 'Чи знали ви?',
    referenceTemplate: 'Глибше: {section}',
    nextLabel: 'Наступне запитання',
    finishLabel: 'Переглянути результат',
    summary: {
      eyebrow: 'Тест завершено',
      scoreTemplate: 'Правильно: {correct} з {total}',
      rankLabel: 'Ваш рівень',
      rankTemplate: 'Ваш рівень: {rank}',
      ranks: {
        reader: {
          name: 'Читач',
          line: 'Перший крок у знайомстві з протоколом зроблено. Матеріали нижче допоможуть закріпити основи.',
        },
        student: {
          name: 'Студент',
          line: 'Ви розумієте основні механізми. Дізнайтеся більше про особливі випадки, щоб поглибити знання.',
        },
        scholar: {
          name: 'Науковець',
          line: 'Ви добре розумієте більшість механізмів. Перегляньте кілька тем нижче, щоб закріпити знання.',
        },
        cartographer: {
          name: 'Картограф',
          line: 'Ви ґрунтовно знаєте протокол. Посилання допоможуть дослідити його тонкощі ще докладніше.',
        },
      },
      studyHeading: 'Запитання для повторення',
      studyIntro: 'Ваша відповідь, правильна відповідь і правило, яке її пояснює.',
      noMissesNote: 'Повторювати нічого — усі відповіді правильні.',
      restartLabel: 'Пройти знову в новому порядку',
      hubLabel: 'Усі рівні',
      nextTierTemplate: 'Перейти до рівня «{tier}»',
    },
  },
  tiers: {
    basic: {
      title: 'Базовий',
      heading: 'Базовий: основи',
      tagline: 'Обриси протоколу: цикли, жести, розподіли та мистецтво.',
      description:
        'Двадцять п’ять запитань про основи — що таке жест, як завершується цикл, куди йде ETH і що робить твір детермінованим. Якщо ви тут уперше, починайте звідси.',
      questions: basicQuestionsTextUk,
    },
    medium: {
      title: 'Середній',
      heading: 'Середній: механіка в русі',
      tagline: 'Механіка в русі: вікна калібрування, напрями витривалості, правила Ради.',
      description:
        'Двадцять п’ять запитань про механізм у русі — криві вартості, петля зворотного зв’язку CST, відмінності між Чемпіоном витривалості та Воїном часу, арифметика зоряного відбору та параметри Ради. Для читачів, які вже спостерігали за одним-двома циклами.',
      questions: mediumQuestionsTextUk,
    },
    hard: {
      title: 'Складний',
      heading: 'Складний: граничні випадки',
      tagline:
        'Особливі випадки й аналіз: гаманці з нетиповою поведінкою, історія оновлень, конвеєр рендерингу.',
      description:
        'П’ятдесят запитань для уважних читачів — правила після спливу відліку, контракти, що відхиляють ETH, чому V2 змінила п’ять речей, що переоцінює V3, як побудована випадковість і що робить інтегратор Йосіди в мистецькому проєкті.',
      questions: hardQuestionsTextUk,
    },
  },
} as const satisfies QuizText;
