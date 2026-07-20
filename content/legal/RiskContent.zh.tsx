import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

export function RiskContentZh({ locale }: { locale: string }) {
  return (
    <>
      <p className="type-eyebrow text-muted-foreground">风险与参与说明</p>
      <h1 className="mt-4 type-display-md text-foreground">Cosmic Signature 风险披露</h1>
      {/* lexicon-allow-start: 法律否认文案须明确列出所排除的类别。 */}
      <p className="mt-6 type-body-lg text-muted-foreground">
        Cosmic Signature 是 Arbitrum
        上的程序化链上艺术协议。它不是彩票、赌场、赌博产品或投资产品，也不承诺任何财务结果。
      </p>
      {/* lexicon-allow-end */}

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">主要风险</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>区块链交易公开，且通常无法撤销。</li>
          <li>钱包安全、私钥保管与交易批准均由参与者自行负责。</li>
          <li>网络拥堵、RPC 中断、索引延迟或应用问题都可能影响使用体验。</li>
          <li>参与前应审阅协议参数、分配规则与时间安排。</li>
          {/* lexicon-allow-start: 否认文案须明确说明不保证财务回报。 */}
          <li>不得将 CST 与 NFT 理解为有保证的回报或金融产品。</li>
          {/* lexicon-allow-end */}
        </ul>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">参与者会做什么</h2>
        <p className="text-muted-foreground">
          参与者在演绎周期中落笔。落笔会影响不断演变的协议状态，可能铭刻参与 CST，并构成确定性
          Cosmic Signature NFT 艺术的创作背景。所有结果均由公开的智能合约机制决定，而非链下承诺。
        </p>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">相关页面</h2>
        <ul className="space-y-3">
          <li>
            {/* lexicon-allow-start: 链接标题列出目标页面明确否认的类别。 */}
            <a
              href={localeHref(LANDING_ORIGIN, '/learn/not-a-lottery-not-an-investment', locale)}
              className="text-primary underline-offset-4 hover:underline"
            >
              Cosmic Signature 是彩票、赌场或投资吗？
            </a>
            {/* lexicon-allow-end */}
          </li>
          <li>
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              服务条款
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
