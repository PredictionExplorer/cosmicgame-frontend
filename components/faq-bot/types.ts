export type FaqMessageRole = 'user' | 'bot' | 'error';

export interface FaqMessage {
  id: string;
  role: FaqMessageRole;
  text: string;
  sources?: string[];
}
