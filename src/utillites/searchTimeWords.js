function searchTimeWords(text) {
  // Create a regular expression pattern to match the words
  const pattern = /\b(hour|day|week|month|year)\b/i;
  // Test the pattern against the input text
  return pattern.test(text);
}
export default searchTimeWords;
