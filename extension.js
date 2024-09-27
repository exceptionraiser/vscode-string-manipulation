const vscode = require("vscode");
const _string = require("underscore.string");
const apStyleTitleCase = require("ap-style-title-case");
const chicagoStyleTitleCase = require("chicago-capitalize");
const slugify = require("@sindresorhus/slugify");
const defaultFunction = (commandName, option) => (str) =>
  _string[commandName](str, option);
const sequence = (str, multiselectData = {}) => {
  return str.replace(/-?\d+/g, (n) => {
    const isFirst = typeof multiselectData.offset !== "number";
    multiselectData.offset = isFirst ? Number(n) : multiselectData.offset + 1;
    return multiselectData.offset;
  });
};
const increment = (str) => str.replace(/-?\d+/g, (n) => Number(n) + 1);
const decrement = (str) => str.replace(/-?\d+/g, (n) => Number(n) - 1);

const commandNameFunctionMap = {
  titleize: defaultFunction("titleize"),
  chop: (n) => defaultFunction("chop", n),
  classify: defaultFunction("classify"),
  clean: defaultFunction("clean"),
  cleanDiacritics: defaultFunction("cleanDiacritics"),
  underscored: defaultFunction("underscored"),
  dasherize: defaultFunction("dasherize"),
  humanize: defaultFunction("humanize"),
  reverse: defaultFunction("reverse"),
  decapitalize: defaultFunction("decapitalize"),
  capitalize: defaultFunction("capitalize"),
  sentence: defaultFunction("capitalize", true),
  camelize: (str) =>
    _string.camelize(str.match(/[a-z]/) ? str : str.toLowerCase()),
  slugify: slugify,
  swapCase: defaultFunction("swapCase"),
  snake: (str) =>
    _string
      .underscored(str)
      .replace(/([A-Z])[^A-Z]/g, " $1")
      .replace(/[^a-z]+/gi, " ")
      .trim()
      .replace(/\s/gi, "_"),
  screamingSnake: (str) =>
    _string
      .underscored(str)
      .replace(/([A-Z])[^A-Z]/g, " $1")
      .replace(/[^a-z]+/gi, " ")
      .trim()
      .replace(/\s/gi, "_")
      .toUpperCase(),
  titleizeApStyle: apStyleTitleCase,
  titleizeChicagoStyle: chicagoStyleTitleCase,
  truncate: (n) => defaultFunction("truncate", n),
  prune: (n) => (str) => str.slice(0, n - 3).trim() + "...",
  repeat: (n) => defaultFunction("repeat", n),
  increment,
  decrement,
  duplicateAndIncrement: (str) => str + increment(str),
  duplicateAndDecrement: (str) => str + decrement(str),
  sequence,
  utf8ToChar: (str) => str.match(/\\u[\dA-Fa-f]{4}/g).map((x) => x.slice(2)).map((x) => String.fromCharCode(parseInt(x, 16))).join(""),
  charToUtf8: (str) => str.split("").map((x) => `\\u${x.charCodeAt(0).toString(16).padStart(4, '0')}`).join(""),
};
const numberFunctionNames = [
  "increment",
  "decrement",
  "sequence",
  "duplicateAndIncrement",
  "duplicateAndDecrement",
];
const functionNamesWithArgument = ["chop", "truncate", "prune", "repeat"];

const stringFunction = async (commandName, context) => {
  const editor = vscode.window.activeTextEditor;
  const selectionMap = {};
  if (!editor) return;

  let multiselectData = {};
  editor.selections.forEach(async (selection, index) => {
    const text = editor.document.getText(selection);
    const textParts = text.split("\n");
    let stringFunc, replaced;

    if (functionNamesWithArgument.includes(commandName)) {
      const value = await vscode.window.showInputBox();
      stringFunc = commandNameFunctionMap[commandName](value);
      replaced = textParts
        .reduce((prev, curr) => prev.push(stringFunc(curr)) && prev, [])
        .join("\n");
    } else if (numberFunctionNames.includes(commandName)) {
      replaced = commandNameFunctionMap[commandName](text, multiselectData);
    } else {
      stringFunc = commandNameFunctionMap[commandName];
      replaced = textParts
        .reduce((prev, curr) => prev.push(stringFunc(curr)) && prev, [])
        .join("\n");
    }
    selectionMap[index] = {selection, replaced};
  });

  editor.edit((builder) => {
    Object.keys(selectionMap).forEach((index) => {
      const {selection, replaced} = selectionMap[index];
      builder.replace(selection, replaced);
    });
  });

  context.globalState.update('lastAction', commandName);
};

const activate = (context) => {
  context.globalState.setKeysForSync(['lastAction']);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `string-manipulation.repeatLastAction`,
      () => {
        const lastAction = context.globalState.get('lastAction');
        if (lastAction) {
          return stringFunction(lastAction, context)
        }
      }
    )
  );

  Object.keys(commandNameFunctionMap).forEach((commandName) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `string-manipulation.${commandName}`,
        () => stringFunction(commandName, context)
      )
    );
  });
};

exports.activate = activate;

module.exports = {
  activate,
  commandNameFunctionMap,
};
