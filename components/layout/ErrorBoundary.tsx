'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { reportError } from '@/utils/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** What the reload action does; the document reload by default. */
  onReload?: () => void;
  messages: {
    title: string;
    description: string;
    /** The reload action's label. */
    reload: string;
    /** The link to the host's home page. */
    home: string;
  };
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Reloads the document: the render that threw would only throw again if re-rendered in place. */
function reloadPage() {
  window.location.reload();
}

export class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    reportError(error, 'ErrorBoundary');
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const { messages } = this.props;
      return (
        <ErrorState
          variant="page"
          headingLevel={2}
          title={messages.title}
          message={messages.description}
          onRetry={this.props.onReload ?? reloadPage}
          retryLabel={messages.reload}
          action={
            <Link
              href="/"
              className={buttonVariants({
                variant: 'ghost',
                size: 'sm',
                className: 'no-underline',
              })}
            >
              {messages.home}
              <ArrowRight aria-hidden />
            </Link>
          }
        />
      );
    }

    return this.props.children;
  }
}

/**
 * The client-render safety net of both hosts (the landing's only one): the
 * shared error state with a reload, which fetches the page afresh instead of
 * re-rendering the tree that just threw, and a link to the host's home.
 */
export default function ErrorBoundary({
  children,
  fallback,
}: Omit<Props, 'messages' | 'onReload'>) {
  const t = useTranslations('errors');
  return (
    <ErrorBoundaryBase
      fallback={fallback}
      messages={{
        title: t('boundary.title'),
        description: t('boundary.description'),
        reload: t('global.retry'),
        home: t('boundary.home'),
      }}
    >
      {children}
    </ErrorBoundaryBase>
  );
}
