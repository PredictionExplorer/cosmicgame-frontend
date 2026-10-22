import type { AuditsCopy } from './AuditsContent';

/** Japanese copy for /audits, rendered by AuditsContent. */
export const auditsCopyJa: AuditsCopy = {
  title: '監査',
  intro:
    '公開監査は、確認された過去のコントラクト版を対象としています。その後のV2やV3の全変更を独立に監査したことにはなりません。公開ソースとデプロイ済みコードの一致確認も、安全性評価とは別です。',
  summary: {
    label: '監査の概要',
    auditor: '監査者',
    published: '報告書の公開',
    findings: '所見',
    criticalOrHigh: '重大・高',
    invariants: '成立した不変条件',
    invariantsValue: '{held}/{tested}',
    runs: 'ファジングの実行回数',
    severity: '深刻度別の所見',
    severities: {
      critical: '重大',
      high: '高',
      medium: '中',
      low: '低',
      informational: '情報',
    },
    reportCta: 'Hackenの報告書を読む',
    repositoryCta: 'コントラクトのリポジトリを見る',
  },
  audit: {
    heading: 'Hackenによる独立監査',
    paragraphs: [
      '公開監査は、確認された過去のコントラクト版を対象としています。その後のV2やV3の全変更を独立に監査したことにはなりません。公開ソースとデプロイ済みコードの一致確認も、安全性評価とは別です。',
      '報告書は各所見を深刻度と状況とともに示し、上の概要がその件数をまとめています。重大または高い深刻度のものはなく、ほとんどはチームが検討して受け入れた設計上のトレードオフを説明するものです。',
      '手動のレビューに加えて、Hackenはシステム不変条件に対してファジングテストを実施しました。たとえば、プロトコルが保持するETHが常に、受け入れた額から支払った額を引いたものに等しいという条件などです。すべての不変条件が成立しました。',
    ],
  },
  analysis: {
    heading: '形式検証と解析',
    paragraphs: [
      'コントラクトのリポジトリには、チームが自ら実行するチェックも含まれています。プロトコルのロジック、ETHの保存、アクセス制御、各ウォレットコントラクトを対象とするCertora Proverの仕様、SolidityのSMTCheckerの設定、Slitherによる静的解析、そして自動テストです。',
      'これらのチェックが証明・検証するのは、それぞれが述べる性質だけです。監査と同じく、リスクを減らしますが、なくすものではありません。詳しくは<risk>リスク開示</risk>をご覧ください。',
    ],
    resources: [
      {
        link: 'certora',
        label: 'Certoraの仕様',
        description: 'Certora Proverが検証する性質と、各実行の設定',
      },
      {
        link: 'smtchecker',
        label: 'SMTCheckerの設定',
        description: 'Solidityのモデル検査を有効にしてコントラクトをコンパイルするスクリプト',
      },
      {
        link: 'slither',
        label: 'Slitherによる解析',
        description: '静的解析とアップグレード可能性のチェック、および実行方法のメモ',
      },
      {
        link: 'tests',
        label: 'テストスイート',
        description: 'コントラクトの自動テスト',
      },
    ],
  },
  checklist: {
    heading: '検証チェックリスト',
    intro: 'コントラクトとやり取りする前に、次の各項目を自分で確認できます。',
    steps: [
      '<contracts>コントラクトページ</contracts>でコントラクトのアドレスを確認します。公式アドレスの一覧はここだけです。',
      '現在のプロトコル実装はV3です。実装アドレスはプロキシのEIP-1967スロットと照合してください。V3の公開ソース検証はまだ確認されておらず、過去のV2の検証は新しい実装には適用されません。詳細：<explorer>Arbiscan</explorer>。',
      '公開監査は、確認された過去のコントラクト版を対象としています。その後のV2やV3の全変更を独立に監査したことにはなりません。公開ソースとデプロイ済みコードの一致確認も、安全性評価とは別です。詳細：<contractsRepository>公開リポジトリ</contractsRepository>、<sourcify>Sourcify</sourcify>。',
      '<hacken>Hackenの報告書</hacken>で、各所見とその対応状況を読みます。',
      'アプリの表示が、オンチェーンのコントラクトの動作と一致していることを確認します。',
    ],
  },
};
