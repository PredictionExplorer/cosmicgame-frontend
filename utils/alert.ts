export default function getErrorMessage(message) {
  const regex = /'(.*?)'/; // Matches anything between single quotes

  const matches = message.match(regex);
  if (matches) {
    const extractedString = matches[1];
    return extractedString;
  }
  return '';
}
