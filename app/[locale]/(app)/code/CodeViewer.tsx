'use client';

import dynamic from 'next/dynamic';
import { createTheme } from '@uiw/codemirror-themes';
import { useTranslations } from 'next-intl';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { CodeWrapper, StyledLink } from '@/components/styled';

import { COSMIC_SIGNATURE_CODE } from './cosmicSignatureCode';

const myTheme = createTheme({
  theme: 'light',
  settings: {
    background: 'transparent',
    fontFamily: 'monospace',
  },
  styles: [],
});

const CodeViewer = () => {
  const t = useTranslations('code');

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader title={t('viewer.title')} titleLevel={2} subtitle={t('viewer.subtitle')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div>
            <p className="text-base leading-[1.8]">{t('viewer.description')}</p>
            <p className="text-base">
              <StyledLink href="https://ipfs.io/ipfs/QmWEao2HjCvyHJSbYnWLyZj8HfFardxzuNh7AUk1jgyXTm">
                ipfs:/QmWEao2HjCvyHJSbYnWLyZj8HfFardxzuNh7AUk1jgyXTm
              </StyledLink>
            </p>
            <p className="mt-3 text-base">
              {t.rich('viewer.github', {
                link: (chunks) => (
                  <StyledLink href="https://github.com/PredictionExplorer">{chunks}</StyledLink>
                ),
              })}
            </p>
          </div>
        </div>
        <div>
          <CodeWrapper className="code-wrapper">
            {
              <CodeMirror
                value={COSMIC_SIGNATURE_CODE}
                theme={myTheme}
                editable={false}
                basicSetup={{ lineNumbers: false, foldGutter: false }}
                height="500px"
                style={{ fontSize: '16px' }}
              />
            }
          </CodeWrapper>
        </div>
      </div>
    </PageShell>
  );
};

export default CodeViewer;
