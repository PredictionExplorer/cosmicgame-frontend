import { useTranslations } from 'next-intl';

import { PageHeader, PageHeaderTabs } from '@/components/layout/PageHeader';

import { OperatorWalletStatus } from './OperatorWalletStatus';
import { OPERATOR_TOOLS, type OperatorToolId } from './operatorTools';

/**
 * The header every operator tool shares: the Admin eyebrow, the tool's H1 and
 * lede, the connected wallet with its on-chain roles, and tabs between the
 * three tools. Renders on the server; only the wallet line runs on the client.
 */
export function OperatorHeader({
  tool,
  title,
  subtitle,
}: {
  tool: OperatorToolId;
  title: string;
  subtitle: string;
}) {
  const t = useTranslations('admin');
  return (
    <PageHeader
      section="admin"
      sectionHub={tool === 'moderation'}
      title={title}
      subtitle={subtitle}
      meta={<OperatorWalletStatus />}
      tabs={
        <PageHeaderTabs
          label={t('tools.label')}
          items={OPERATOR_TOOLS.map(({ id, href }) => ({
            href,
            label: t(`tools.${id}`),
            current: id === tool,
          }))}
        />
      }
    />
  );
}
