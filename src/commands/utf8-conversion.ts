import { CommandFunction } from "./types";

export const utf8ToChar: CommandFunction = (str: string) =>
  str
    .match(/\\u[\dA-Fa-f]{4}/g)
    ?.map((x) => x.slice(2))
    .map((x) => String.fromCharCode(parseInt(x, 16)))
    .join("") || "";

export const charToUtf8: CommandFunction = (str: string) =>
  str
    .split("")
    .map((x) => `\\u${x.charCodeAt(0).toString(16).padStart(4, "0")}`)
    .join("");
