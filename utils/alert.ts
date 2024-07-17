export default function getErrorMessage(message) {
  const regex = /"([^"]*)"/;

  const matches = message.match(regex);
  if (matches) {
    const extractedString = matches[1];
    return extractedString;
  } else {
    let arr = message.split(":");
    if (arr.length > 1) {
      return arr.slice(1).join(":");
    }
  }
  return '';
}
