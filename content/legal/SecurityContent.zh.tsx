import { Link } from '@/i18n/navigation';

export function SecurityContentZh() {
  return (
    <>
      <p className="type-eyebrow text-muted-foreground">信任与安全</p>
      <h1 className="mt-4 type-display-md text-foreground">Cosmic Signature 安全</h1>
      <p className="mt-6 type-body-lg text-muted-foreground">
        Cosmic Signature 是 Arbitrum
        上的程序化链上艺术协议。其安全体系依靠公开的智能合约、透明的协议数据、审慎的钱包交互，以及清晰的参与者教育。
      </p>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">安全模型</h2>
        <p className="text-muted-foreground">
          协议操作由 Arbitrum
          智能合约记录。连接钱包或落笔前，公开页面应便于用户与抓取工具检查合约地址、源代码资源、验证背景及运行假设。
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li className="[overflow-wrap:anywhere]">
            请使用官方应用 `https://app.cosmicsignature.com/`。
          </li>
          <li>进行链上交互前，请在合约页面核对合约地址。</li>
          <li>仔细审阅钱包提示；区块链交易无法撤销。</li>
          <li>不得将 CST、NFT、落笔或分配视为有保证的财务结果。</li>
        </ul>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">验证资源</h2>
        <p className="text-muted-foreground">
          可见的应用内容、已验证合约、源代码与 Arbitrum 实时数据彼此一致，是最有力的安全信号。
        </p>
        <ul className="space-y-3">
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              Cosmic Signature 合约与 Arbitrum 地址
            </Link>
          </li>
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              Cosmic Signature 源代码与渲染流水线
            </Link>
          </li>
          <li>
            <Link href="/audits" className="text-primary underline-offset-4 hover:underline">
              审计与形式化验证说明
            </Link>
          </li>
          <li>
            <Link
              href="/risk-disclosures"
              className="text-primary underline-offset-4 hover:underline"
            >
              风险披露与参与说明
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
}
