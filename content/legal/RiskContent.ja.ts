import { protocolFacts as facts } from '@/content/protocol-facts';

import type { RiskCopy } from './RiskContent';

/** Japanese copy for /risk-disclosures, rendered by RiskContent. */
export const riskCopyJa: RiskCopy = {
  title: 'リスク開示',
  // lexicon-allow-start: explicit legal denial copy must name the denied categories.
  intro:
    'Cosmic SignatureはArbitrum上のプロシージャル・オンチェーンアート・プロトコルです。宝くじ、カジノ、ギャンブル商品、投資商品ではなく、金銭的な結果を約束するものでもありません。',
  // lexicon-allow-end
  keyPoint: {
    title: '参加する前に',
    text: '一筆には、失っても困らない資金だけを使ってください。一筆に支払った額は、サイクルがその後どうなっても払い戻されません。',
  },
  groups: [
    {
      id: 'mechanics',
      heading: 'サイクルの仕組み',
      risks: [
        '一筆に支払ったETHやCSTは、後から別の一筆が続いても払い戻されません。',
        `ETHの一筆のたびに、次のETHの一筆の費用が${facts.ethGestureCostStepUpPercent}%上がります。一筆を重ねるほど、費用は高くなります。`,
        '調律期間によってCSTの一筆の費用は変わります。CSTの一筆がない間は下がり続け、CSTの一筆が入るたびに高い値から再び始まります。そのため、表示された費用がトランザクションの確定前に変わることがあります。',
      ],
      source:
        'ルールは利用規約の<termsMechanics>プロトコルの仕組みとスマートコントラクト</termsMechanics>にあります。',
    },
    {
      id: 'timing',
      heading: 'タイミングと受け取り',
      risks: [
        `最後の一筆を入れた参加者は、サイクル確定時刻から${facts.finalGestureExclusivityHours}時間、単独でサイクルを確定できます。その後は誰でも確定でき、コントラクトのルールにより、確定した人がシグネチャー配分の受領者になります。`,
        `その他のETHの配分と添付された資産は、既定では受領者のために${facts.secondaryRetrievalTimeoutWeeks}週間保持されます。その後は、残ったものを誰でも自分で受け取れます。`,
      ],
      source: 'ルールは利用規約の<termsRetrieval>配分の受け取り</termsRetrieval>にあります。',
    },
    {
      id: 'permanent',
      heading: '取り消せない操作',
      risks: [
        '確定したトランザクションは、取り消し、中止、払い戻しのいずれもできません。',
        'ETHの一筆の費用の引き下げに使ったRandom Walk NFTは使用済みになり、二度と引き下げには使えません。',
        'NFTを係留できるのは一度だけです。係留を解除した後、再び係留することはできません。',
      ],
      source:
        'ルールは利用規約の<termsRandomWalk>Random Walk NFTによる費用の引き下げ</termsRandomWalk>にあります。',
    },
    {
      id: 'wallets',
      heading: 'ウォレットと鍵',
      risks: [
        '鍵を持つのは本人だけです。シードフレーズを知る人はウォレットを操作でき、失くしたシードフレーズは取り戻せません。',
        'ウォレットの承認は、見た目より多くの権限を与えることがあります。承認の内容をすべて読み、<securityOfficial>公式のアドレス</securityOfficial>だけを使ってください。',
      ],
      source:
        'ルールは利用規約の<termsEligibility>利用資格とアカウントの要件</termsEligibility>にあります。',
    },
    {
      id: 'availability',
      heading: 'ネットワークとアプリ',
      risks: [
        'ネットワークの混雑、RPCの障害、データ反映の遅延、アプリの不具合により、トランザクションやこのサイトに表示されるデータが遅れたり止まったりすることがあります。',
        'このサイトの表示は、チェーンの状態より数秒以上遅れることがあります。両者が異なるときは、Arbitrum上のコントラクトが正です。',
        'スマートコントラクトには、監査で見つからなかった不具合があるかもしれません。監査で確認した範囲は<audits>監査</audits>をご覧ください。',
      ],
      source: 'ルールは利用規約の<termsRisks>リスクと免責事項</termsRisks>にあります。',
    },
    {
      id: 'value',
      heading: '価値と結果',
      risks: [
        'ETH、CST、NFTの市場価値は大きく変動し、ゼロになることもあります。',
        // lexicon-allow-start: denial copy states that no financial return is guaranteed.
        'CSTとNFTは、保証されたリターンや金融商品として理解されるべきではありません。',
        // lexicon-allow-end
        'どの一筆も配分を保証しません。結果は公開されたコントラクトのルールで決まり、オフチェーンでの約束に基づくものではありません。',
      ],
      source:
        'ルールは利用規約の<termsNoGuarantee>結果の保証はありません</termsNoGuarantee>にあります。',
    },
  ],
  participation: {
    heading: '参加者がすること',
    paragraphs: [
      '参加者はパフォーマンス・サイクルの間に一筆を入れます。一筆はプロトコルの状態に影響し、参加CSTが刻印されることもあります。その記録が、決定論的なCosmic Signature NFT作品の背景を形づくります。結果は公開スマートコントラクトのルールで決まり、オフチェーンでの約束に基づくものではありません。',
      // lexicon-allow-start: link label names the categories denied by the linked page.
      'Cosmic Signatureが<notALottery>宝くじ、カジノ、投資ではない</notALottery>理由をお読みください。',
      // lexicon-allow-end
    ],
  },
};
