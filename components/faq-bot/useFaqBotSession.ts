'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { FaqBotError, faqHealth, faqQuery } from '@/services/api/faqBot';

import type { FaqMessage } from './types';

const WELCOME_MESSAGE =
  "Hi — I'm the Cosmic Signature assistant. Ask about bidding, contracts, prizes, or live game stats.";

function nextMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseFaqBotSessionResult {
  messages: FaqMessage[];
  sessionId: string | null;
  loading: boolean;
  contextExpired: boolean;
  healthStatus: 'unknown' | 'healthy' | 'degraded';
  healthLabel: string;
  sendMessage: (question: string) => Promise<void>;
  resetSession: () => void;
}

export function useFaqBotSession(enabled: boolean): UseFaqBotSessionResult {
  const [messages, setMessages] = useState<FaqMessage[]>([
    { id: nextMessageId(), role: 'bot', text: WELCOME_MESSAGE },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [contextExpired, setContextExpired] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'healthy' | 'degraded'>('unknown');
  const [healthLabel, setHealthLabel] = useState('Checking assistant…');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkHealth = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await faqHealth();
      if (!mountedRef.current) return;
      if (data.status === 'healthy') {
        setHealthStatus('healthy');
        const ttl = data.sessions?.ttl_seconds;
        const ttlLabel = ttl ? `${Math.round(ttl / 60)} min idle` : '1 hour idle';
        const docs = data.haystack?.documents;
        setHealthLabel(
          docs != null
            ? `Ready · ${docs} docs · context expires after ${ttlLabel}`
            : `Ready · context expires after ${ttlLabel}`,
        );
      } else {
        setHealthStatus('degraded');
        setHealthLabel('Assistant temporarily unavailable');
      }
    } catch {
      if (!mountedRef.current) return;
      setHealthStatus('degraded');
      setHealthLabel('Cannot reach assistant');
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void checkHealth();
  }, [checkHealth, enabled]);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setContextExpired(false);
    setLoading(false);
    setMessages([{ id: nextMessageId(), role: 'bot', text: WELCOME_MESSAGE }]);
    void checkHealth();
  }, [checkHealth]);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || loading || contextExpired) return;

      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: 'user', text: trimmed },
      ]);
      setLoading(true);

      try {
        const data = await faqQuery(trimmed, sessionId);
        if (!mountedRef.current) return;
        setSessionId(data.session_id);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: 'bot',
            text: data.answer || '(empty answer)',
            sources: data.sources,
          },
        ]);
      } catch (err) {
        if (!mountedRef.current) return;
        const faqErr = err instanceof FaqBotError ? err : null;
        const message = faqErr?.message || String(err);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: 'error',
            text: faqErr?.component ? `[${faqErr.component}] ${message}` : message,
          },
        ]);
        if (faqErr && (faqErr.status === 410 || faqErr.component === 'session')) {
          setContextExpired(true);
          setHealthStatus('degraded');
          setHealthLabel('Context expired — start a new chat');
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [contextExpired, loading, sessionId],
  );

  return {
    messages,
    sessionId,
    loading,
    contextExpired,
    healthStatus,
    healthLabel,
    sendMessage,
    resetSession,
  };
}
