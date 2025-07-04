import * as vscode from "vscode";

export interface MultiSelectData {
  offset?: number;
}

export type StringFunction = (
  str: string,
  multiselectData?: MultiSelectData
) => string;

export type CommandFunction =
  | StringFunction
  | ((...args: any[]) => StringFunction);

export interface CommandRegistry {
  [key: string]: CommandFunction;
}

export const numberFunctionNames = [
  "increment",
  "decrement",
  "sequence",
  "duplicateAndIncrement",
  "duplicateAndDecrement",
  "incrementFloat",
  "decrementFloat",
];

export const functionNamesWithArgument = [
  "chop",
  "truncate",
  "prune",
  "repeat",
];
