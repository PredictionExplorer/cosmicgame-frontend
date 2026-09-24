import { formatCount } from '@/utils/format';

import { AUDIT_FINDINGS_TOTAL, HACKEN_AUDIT } from './audit';
import type { AuditsCopy } from './AuditsContent';

const { findings, invariants } = HACKEN_AUDIT;
const count = (value: number) => formatCount(value, 'ja');

/** Japanese copy for /audits, rendered by AuditsContent. */
export const auditsCopyJa: AuditsCopy = {
  title: '監査',
  intro:
    'HackenによるCosmic Signatureコントラクトの独立監査、コントラクトのリポジトリにある形式検証と解析、そしてコントラクトを自分で確かめる方法をまとめています。',
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
    repositoryCta: '監査対象のコントラクトを見る',
  },
  audit: {
    heading: 'Hackenによる独立監査',
    paragraphs: [
      `2025年後半、HackenはCosmic Signatureのスマートコントラクトの独立したセキュリティレビューを実施しました。対象は公開リポジトリの本番コントラクトで、各サイクルを動かす中核プロトコルから、CSTトークン、二つのNFTコレクション、係留ウォレット、それらを支えるウォレットとシステム管理のコントラクトまでを含みます。Hackenは2026年1月に最終報告書を公開しました。`,
      `報告書には${count(AUDIT_FINDINGS_TOTAL)}件の所見が挙げられていますが、重大または高い深刻度のものはありません。中程度が${count(findings.medium)}件、低が${count(findings.low)}件、情報提供が${count(findings.informational)}件です。ほとんどは、チームが検討して受け入れた設計上のトレードオフを説明するもので、報告書は各所見をその状況とともに解説しています。`,
      `手動のレビューに加えて、Hackenは${count(invariants.tested)}のシステム不変条件に対してファジングテストを実施しました。たとえば、プロトコルが保持するETHが常に、受け入れた額から支払った額を引いたものに等しいという条件などです。${count(invariants.held)}件すべてが${count(invariants.runs)}回の実行にわたって成立しました。`,
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
      '<explorer>Arbiscan</explorer>でそのアドレスを開き、Arbitrum One上にあり、ソースコードが検証済みであることを確認します。',
      'そのソースを<contractsRepository>公開リポジトリ</contractsRepository>と比べるか、<sourcify>Sourcify</sourcify>で完全一致を確認します。',
      '<hacken>Hackenの報告書</hacken>で、各所見とその対応状況を読みます。',
      'アプリの表示が、オンチェーンのコントラクトの動作と一致していることを確認します。',
    ],
  },
};
