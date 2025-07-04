import { CommandFunction } from "./types";

export const randomCase: CommandFunction = (input: string): string => {
  let result = "";
  for (const char of input) {
    if (Math.random() < 0.5) {
      result += char.toLowerCase();
    } else {
      result += char.toUpperCase();
    }
  }
  return result;
};
