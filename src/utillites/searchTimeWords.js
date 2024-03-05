function searchTimeWords(text) {
  // Create a regular expression pattern to match the words
  const pattern =
    /\b(hour|hours|day|days|week|weeks|month|months|year|years)\b/i;
  // Test the pattern against the input text
  return pattern.test(text);
}
export default searchTimeWords;
