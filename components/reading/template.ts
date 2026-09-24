import { Fragment, createElement, type ReactNode } from 'react';

const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Fills `{name}` placeholders in a content-module template. Content modules
 * are plain strings, not ICU messages: a placeholder with no value is left
 * as written, so a missing value shows up in review instead of vanishing.
 */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(PLACEHOLDER, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * `fillTemplate` for values that are elements ("Your standing: <strong>…</strong>").
 * The template carries each locale's own punctuation and word order around
 * the value (a full-width colon and no space in Chinese and Japanese), so a
 * component never joins a label and its value with a hard-coded ': '.
 */
export function renderTemplate(template: string, values: Record<string, ReactNode>): ReactNode[] {
  // With one capture group, split() alternates literal text (even indexes)
  // and placeholder names (odd indexes).
  return template.split(PLACEHOLDER).map((part, index) => {
    const isPlaceholder = index % 2 === 1;
    const content = isPlaceholder ? (part in values ? values[part] : `{${part}}`) : part;
    return createElement(Fragment, { key: index }, content);
  });
}
