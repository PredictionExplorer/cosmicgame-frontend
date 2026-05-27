import type { FaqMessage, FaqMessageRole } from './types';

function roleLabel(role: FaqMessageRole): string {
  switch (role) {
    case 'user':
      return 'USER';
    case 'bot':
      return 'ASSISTANT';
    case 'error':
      return 'ERROR';
  }
}

export function hasCopyableConversation(messages: FaqMessage[]): boolean {
  return messages.some((message) => message.role === 'user');
}

export function formatFaqConversation(
  messages: FaqMessage[],
  sessionId: string | null,
): string {
  const lines = [
    'Cosmic Signature FAQ — conversation export',
    `Exported: ${new Date().toISOString()}`,
    `Session ID: ${sessionId ?? '(none)'}`,
    '---',
    '',
  ];

  messages.forEach((entry, index) => {
    lines.push(`[${index + 1}] ${roleLabel(entry.role)}`);
    lines.push(entry.text);
    if (entry.sources?.length) {
      lines.push('Sources:');
      entry.sources.forEach((source) => lines.push(`  - ${source}`));
    }
    lines.push('');
  });

  return `${lines.join('\n').trim()}\n`;
}
