/** Extracts a user-facing error message from a raw error string by pulling quoted text or text after the first colon. */
export default function getErrorMessage(message: string): string {
  const regex = /"([^"]*)"/;

  const matches = message.match(regex);
  if (matches) {
    return matches[1] ?? message;
  } else {
    let arr = message.split(':');
    if (arr.length > 1) {
      return arr.slice(1).join(':');
    }
  }
  return '';
}
