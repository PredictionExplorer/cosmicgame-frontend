/**
 * Fills `{name}` placeholders in a content-module template. Content modules
 * are plain strings, not ICU messages: a placeholder with no value is left
 * as written, so a missing value shows up in review instead of vanishing.
 */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
