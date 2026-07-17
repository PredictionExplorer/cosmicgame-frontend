'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { reportError } from '@/utils/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  messages: {
    title: string;
    description: string;
    retry: string;
  };
}

interface State {
  hasError: boolean;
  error: Error | null;
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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-8">
          <h5 className="mb-2 text-xl font-semibold text-foreground">
            {this.props.messages.title}
          </h5>
          <p className="mb-4 text-sm text-muted-foreground">{this.props.messages.description}</p>
          <Button variant="outline" onClick={this.handleReset}>
            {this.props.messages.retry}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children, fallback }: Omit<Props, 'messages'>) {
  const t = useTranslations('errors');
  return (
    <ErrorBoundaryBase
      fallback={fallback}
      messages={{
        title: t('boundary.title'),
        description: t('boundary.description'),
        retry: t('boundary.retry'),
      }}
    >
      {children}
    </ErrorBoundaryBase>
  );
}
