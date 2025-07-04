# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Compilation
- `npm run build` - Full production build with type checking and linting
- `npm run compile` - Development build with type checking and linting
- `npm run watch` - Watch mode for development with parallel processes
- `npm run check-types` - Type checking only
- `npm run lint` - ESLint code linting

### Testing
- `npm test` - Run all tests (includes compilation, linting, and test execution)
- `npm run pretest` - Prepare for testing (compile, build, lint)
- `npm run compile-tests` - Compile TypeScript tests to JavaScript
- `npm run watch-tests` - Watch mode for test compilation

### Packaging
- `npm run package` - Create VSIX package for distribution
- `npm run vsce` - Direct vsce command access

## Architecture Overview

This is a VSCode extension that provides string manipulation commands for text editing. The extension follows a modular command-based architecture:

### Core Structure
- **Main Extension**: `src/extension.ts` - Entry point that activates string manipulation commands, preview functionality, and optional sidebar
- **Command Registry**: `src/commands/index.ts` - Central registry that maps command names to functions and handles command execution
- **Command Modules**: Individual files in `src/commands/` for specialized functionality:
  - `default-functions.ts` - Basic string transformations using underscore.string
  - `increment-decrement.ts` - Number manipulation commands
  - `sequence.ts` - Number sequencing functionality
  - `title-case.ts` - Specialized title casing (AP Style, Chicago Style)
  - `preview.ts` - Live preview functionality for transformations
  - `sidebar.ts` - Optional webview sidebar (Labs feature)

### Command System
The extension registers VSCode commands dynamically from the `commandNameFunctionMap` registry. Each command:
1. Gets active editor selections
2. Applies transformation function to selected text
3. Replaces selections with transformed text
4. Stores last action for repeat functionality

### Key Features
- **Multi-selection support**: All commands work with multiple text selections
- **Preview mode**: Live preview of transformations before applying
- **Argument-based commands**: Some commands (like `chop`, `truncate`) prompt for numeric arguments
- **Duplicate operations**: Special handling for duplicate-and-increment/decrement commands
- **Labs features**: Experimental features behind a configuration flag

### Build System
Uses esbuild for fast bundling with TypeScript compilation. The build outputs to `dist/extension.js` as a CommonJS bundle suitable for VSCode.

### Testing
Tests are located in `src/test/` and use the VSCode testing framework with Mocha.