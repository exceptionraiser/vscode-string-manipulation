import { CommandFunction } from "./types";
const slugifyLib = require("@sindresorhus/slugify");

export const slugify: CommandFunction = slugifyLib;
