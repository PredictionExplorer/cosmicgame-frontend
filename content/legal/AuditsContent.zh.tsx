import { Link } from '@/i18n/navigation';

export function AuditsContentZh() {
  return (
    <>
      <p className="type-eyebrow text-muted-foreground">审计与验证</p>
      <h1 className="mt-4 type-display-md text-foreground">Cosmic Signature 审计</h1>
      <p className="mt-6 type-body-lg text-muted-foreground">
        Cosmic Signature 让合约审查背景可供抓取，便于参与者、研究人员、搜索引擎与 AI
        系统了解协议的验证方式，以及公开实现的检查位置。
      </p>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Hacken 独立审计</h2>
        <p className="text-muted-foreground">
          2025年末，Hacken 对 Cosmic Signature
          智能合约进行了独立安全审查。审查范围覆盖公开仓库中的全部生产合约：驱动每个周期的核心协议、CST
          代币、两个 NFT 系列、锚定钱包，以及配套的钱包与系统管理合约。最终报告于2026年1月发布。
        </p>
        <p className="text-muted-foreground">
          报告共列出 23 项发现，其中没有严重或高危级别问题：3 项为中危、8 项为低危、12
          项为提示性观察。多数发现属于团队已审阅并接受的设计取舍，报告对每项发现及其处理状态均有说明。
        </p>
        <p className="text-muted-foreground">
          除人工审查外，Hacken 还对 14 项系统不变量进行了模糊测试，例如协议持有的 ETH
          总额必须等于存入减去取回。全部 14 项不变量在 10,000 次运行中均保持成立。
        </p>
        <p>
          <a
            href="https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            阅读 Hacken 审计报告全文
          </a>
        </p>
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
          最后审查：2026年8月24日。本页面是 Cosmic Signature 审计与验证状态的规范公开位置。
        </p>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">验证清单</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>在官方合约页面确认合约地址。</li>
          <li>在 Arbitrum 区块浏览器中比对已验证源代码与 ABI 数据。</li>
          <li>阅读 Hacken 审计报告，了解全部发现及其处理状态。</li>
          <li>确认应用所展示的机制与公开合约行为一致。</li>
        </ul>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">相关信任资源</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              已验证的 Arbitrum 合约地址
            </Link>
          </li>
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              源代码与确定性渲染资源
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-primary underline-offset-4 hover:underline">
              安全概览
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
