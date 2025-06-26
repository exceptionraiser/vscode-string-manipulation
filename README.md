![CI](https://img.shields.io/github/actions/workflow/status/marclipovsky/vscode-string-manipulation/ci.yml) ![open vsx](https://img.shields.io/open-vsx/v/marclipovsky/string-manipulation) ![VS Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/marclipovsky.string-manipulation) ![VS Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/marclipovsky.string-manipulation)  ![VS Marketplace Stars](https://img.shields.io/visual-studio-marketplace/stars/marclipovsky.string-manipulation)  ![VS Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/marclipovsky.string-manipulation) ![VS Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/marclipovsky.string-manipulation)

> **📢 Now available on Cursor!**

# String Manipulation for VSCode & Cursor

This extension provides string manipulation commands for any selected text as well
as multiple selections.

Current string functions available:

1. camelize - converts hyphenated strings to camelCase
1. capitalize - capitalizes the first character of each selection
1. classify - converts underscored text to PascalCase
1. chop - splits into groups provided n # of characters
1. clean - collapses multiple spaces into one
1. clean diacritics - removes diacritic marks from characters
1. dasherize - converts camelCase to kebab-case
1. decapitalize - lowercases the first character of each selection
1. humanize - converts text to human-readable form
1. reverse - reverses the characters in the selection
1. screaming snake - converts text to SCREAMING_SNAKE_CASE
1. sentence - transforms text to sentence case
1. slugify - converts text to a URL-friendly slug
1. snake - converts text to snake_case
1. swap case - inverts the case of each character
1. titleize - capitalizes the first letter of each word
1. titleize (AP Style) - capitalizes titles according to AP style
1. titleize (Chicago Style) - capitalizes titles according to Chicago style
1. truncate - trims string to n # of characters and appends ellipsis
1. prune - truncate but keeps ellipsis within character count provided
1. repeat - repeat selection n # of times
1. random case - randomly changes the case of characters
1. swap quotes - swaps between single and double quotes
1. utf8ToChar - converts Unicode escapes to characters
1. charToUtf8 - converts characters to Unicode escapes

Number related functions:

1. increment - increases all numbers in the selection by 1
1. decrement - decreases all numbers in the selection by 1
1. duplicate and increment - duplicates selection and increments all numbers
1. duplicate and decrement - duplicates selection and decrements all numbers
1. sequence - replaces numbers with a sequence starting from the first number
1. incrementFloat - increases all floating point numbers in the selection by 1
1. decrementFloat - decreases all floating point numbers in the selection by 1

Additional utility commands:

1. repeat last action - repeats the last string manipulation command that was executed

## Use

To use these commands, press ⌘+p and enter any of the commands above while text is selected in your editor.

![String Manipulation Screencast](images/demo.gif)

## Preview Transformations

The extension now includes a powerful preview feature that allows you to see how each transformation will affect your text before applying it.

### How to Use the Preview Feature

1. Select the text you want to transform
2. Right-click to open the context menu
3. Choose "Show Transformations with Preview"
4. Browse through the available transformations with instant previews
5. Select a transformation to apply it to your text

This feature makes it easier to find the right transformation without trial and error.

![String Manipulation Preview Feature](images/preview-demo.gif)

## 🎛️ Custom Commands

Create your own regex-based string manipulation commands! Define custom transformations that fit your specific workflow needs.

### Quick Start with Custom Commands

1. **Select text** in your editor
2. **Open Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. **Type "String Manipulation: Custom Command"**
4. **Choose from your configured commands** (or add some if none exist)

### Setting Up Custom Commands

Add custom commands to your VS Code settings:

```json
{
  "stringManipulation.customCommands": [
    {
      "name": "Extract Numbers",
      "searchPattern": "[^0-9]",
      "replacement": "",
      "global": true
    },
    {
      "name": "Wrap in Quotes",
      "searchPattern": "^(.*)$",
      "replacement": "\"$1\""
    },
    {
      "name": "Camel to Snake",
      "searchPattern": "([a-z])([A-Z])",
      "replacement": "$1_$2",
      "global": true
    }
  ]
}
```

### Regular Expression Flags

Use intuitive boolean properties instead of cryptic flag letters. See the [MDN RegExp flags documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#advanced_searching_with_flags) for detailed information.

| Property | Flag | Description |
|----------|------|-------------|
| `global` | `g` | Find all matches rather than stopping after the first |
| `ignoreCase` | `i` | Case-insensitive search |
| `multiline` | `m` | `^` and `$` match start/end of line |
| `dotAll` | `s` | `.` matches newline characters |
| `unicode` | `u` | Enable full Unicode support |
| `sticky` | `y` | Match only at specific index |

### Custom Command Features

- **🔍 Live Previews**: See transformation results before applying
- **✅ Validation**: Real-time regex pattern validation with helpful errors
- **🔄 Multi-selection**: Works with multiple text selections
- **🎯 Saved & Reusable**: Your commands are stored and accessible anytime
- **🔗 Integration**: Works with repeat last action and other features

📖 **[Complete Custom Commands Guide](CUSTOM-COMMANDS.md)** - Detailed examples and advanced usage

## 🧪 Introducing Labs Features

Introducing String Manipulation Labs

We're excited to announce the launch of String Manipulation Labs—a collection of (really just one at this moment) experimental features designed to enhance and expand the capabilities of the String Manipulation extension. Labs features are disabled by default to ensure a stable experience with the core functionalities.

### 🚀 How to Enable Labs Features

To try out the new Labs features, follow these simple steps:

	1.	Open VSCode Settings:
	•	Press Ctrl + , (Windows/Linux) or Cmd + , (macOS), or navigate to File > Preferences > Settings.
	2.	Search for Labs Settings:
	•	In the search bar, type stringManipulation.labs.
	3.	Enable Labs Features:
	•	Toggle the String Manipulation Labs setting to On.

### 🛠️ We Value Your Feedback

Since Labs features are experimental, your feedback is invaluable! Let us know your thoughts, report any issues, or suggest improvements to help us refine these tools.

Thank you for using String Manipulation!
Your support helps us build better tools for the community.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
