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
        <h2 className="text-2xl font-semibold">审查状态</h2>
        <p className="text-muted-foreground">
          合约页面列出了公开的 Arbitrum
          部署与验证背景。审计报告、形式化验证说明及源代码引用发布或更新后，均应从本页面提供链接。
        </p>
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
          最后审查：2026年5月31日。本页面是 Cosmic Signature 审计与验证状态的规范公开位置。
        </p>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">验证清单</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>在官方合约页面确认合约地址。</li>
          <li>在 Arbitrum 区块浏览器中比对已验证源代码与 ABI 数据。</li>
          <li>发布后审阅形式化验证说明与审计摘要。</li>
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
