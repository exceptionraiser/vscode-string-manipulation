import { CommandFunction } from "./types";
const apStyleTitleCase = require("ap-style-title-case");
const chicagoStyleTitleCase = require("chicago-capitalize");

export const titleizeApStyle: CommandFunction = apStyleTitleCase;
export const titleizeChicagoStyle: CommandFunction = chicagoStyleTitleCase;
