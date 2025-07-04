import * as underscore from "underscore.string";
import { CommandFunction } from "./types";

export const defaultFunction =
  (commandName: string, option?: any) => (str: string) =>
    (underscore as any)[commandName](str, option);

export const snake = (str: string) =>
  underscore
    .underscored(str)
    .replace(/([A-Z])[^A-Z]/g, " $1")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .replace(/\s/gi, "_");

export const screamingSnake: CommandFunction = (str: string) =>
  snake(str).toUpperCase();

export const camelize: CommandFunction = (str: string) =>
  underscore.camelize(/[a-z]/.test(str) ? str : str.toLowerCase());

// Default functions
export const titleize: CommandFunction = defaultFunction("titleize");
export const classify: CommandFunction = defaultFunction("classify");
export const clean: CommandFunction = defaultFunction("clean");
export const cleanDiacritics: CommandFunction =
  defaultFunction("cleanDiacritics");
export const dasherize: CommandFunction = defaultFunction("dasherize");
export const humanize: CommandFunction = defaultFunction("humanize");
export const reverse: CommandFunction = defaultFunction("reverse");
export const decapitalize: CommandFunction = defaultFunction("decapitalize");
export const capitalize: CommandFunction = defaultFunction("capitalize");
export const sentence: CommandFunction = defaultFunction("capitalize", true);
export const swapCase: CommandFunction = defaultFunction("swapCase");

// Functions with arguments
export const chop: CommandFunction = (n: number) => defaultFunction("chop", n);
export const truncate: CommandFunction = (n: number) =>
  defaultFunction("truncate", n);
export const prune: CommandFunction = (n: number) => (str: string) =>
  str.slice(0, n - 3).trim() + "...";
export const repeat: CommandFunction = (n: number) =>
  defaultFunction("repeat", n);
