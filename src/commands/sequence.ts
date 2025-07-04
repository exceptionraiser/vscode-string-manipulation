import { CommandFunction, MultiSelectData } from "./types";

export const sequence: CommandFunction = (
  str: string,
  multiselectData: MultiSelectData = {}
) => {
  // First pass: find all numbers and determine the maximum length for zero padding
  const numbers = Array.from(str.matchAll(/-?\d+/g));
  const maxLength = Math.max(...numbers.map(match => {
    const num = match[0];
    // Only consider numbers with leading zeros for max length calculation
    if (num.length > 1 && num.charAt(num.charAt(0) === '-' ? 1 : 0) === '0') {
      return num.length;
    }
    return 0;
  }));

  return str.replaceAll(/-?\d+/g, (n) => {
    const isFirst = typeof multiselectData.offset !== "number";
    multiselectData.offset = isFirst
      ? Number(n)
      : (multiselectData.offset || 0) + 1;

    const sequenceValue = multiselectData.offset;

    // Use max length for consistent padding if any number in the string has leading zeros
    if (maxLength > 0) {
      const isNegative = sequenceValue < 0;
      const sequenceStr = String(sequenceValue);

      if (isNegative) {
        // For negative numbers, pad after the minus sign
        const absStr = sequenceStr.substring(1);
        return "-" + absStr.padStart(maxLength - 1, "0");
      } else {
        // For positive numbers, pad the entire string
        return sequenceStr.padStart(maxLength, "0");
      }
    }

    return String(sequenceValue);
  });
};
