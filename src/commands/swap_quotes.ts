export const swapQuotes = (str: string): string => {
  const singleQuote = "'";
  const doubleQuote = '"';

  // Check if the string is at least two characters and starts and ends with the same quote
  if (str.length < 2) {
    return str; // Return as is if not properly quoted
  }

  const firstChar = str[0];
  const lastChar = str[str.length - 1];

  if (
    (firstChar !== singleQuote && firstChar !== doubleQuote) ||
    firstChar !== lastChar
  ) {
    // Not properly quoted, return as is
    return str;
  }

  const originalQuote = firstChar;
  const newQuote = originalQuote === singleQuote ? doubleQuote : singleQuote;
  let content = str.slice(1, -1);

  // Swap inner quotes
  content = content.replace(/['"]/g, (match, offset) => {
    // Determine if the quote is part of an apostrophe
    const prevChar = content[offset - 1];
    const nextChar = content[offset + 1];
    const isApostrophe =
      match === "'" &&
      /[a-zA-Z]/.test(prevChar || "") &&
      /[a-zA-Z]/.test(nextChar || "");

    if (isApostrophe) {
      // Handle apostrophe based on the desired output
      if (newQuote === singleQuote) {
        // Escape apostrophe when outer quote is single quote
        return "\\'";
      } else {
        // Keep apostrophe as is when outer quote is double quote
        return match;
      }
    } else {
      // Swap the quote
      return match === originalQuote ? newQuote : originalQuote;
    }
  });

  // Return the new string with swapped quotes
  return newQuote + content + newQuote;
};
