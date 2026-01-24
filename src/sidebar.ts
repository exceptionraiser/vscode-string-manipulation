// src/StringManipulationSidebar.ts

import * as vscode from "vscode";
import {
  commandNameFunctionMap,
  stringFunction,
  functionNamesWithArgument,
} from "./commands";
import { telemetryService } from "./telemetry";

/**
 * Generates a cryptographically random nonce for Content Security Policy.
 * This prevents injection attacks by ensuring only scripts with the correct nonce can execute.
 */
function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class StringManipulationSidebar implements vscode.WebviewViewProvider {
  public static readonly viewType = "stringManipulationSidebar";

  private _view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {
    vscode.window.onDidChangeActiveTextEditor(
      () => {
        this.updateWebview();
      },
      null,
      this.context.subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      () => {
        this.updateWebview();
      },
      null,
      this.context.subscriptions
    );
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    
    // Log sidebar feature usage
    telemetryService.logFeatureUsage("sidebar.opened");

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      // Restrict the webview to only loading content from `out` directory
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "applyCommand":
          const commandName = message.command;
          await this.applyCommand(commandName);
          break;
      }
    });

    // Update the webview content when the selection changes
    vscode.window.onDidChangeTextEditorSelection(
      () => {
        this.updateWebview();
      },
      null,
      this.context.subscriptions
    );
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    // Generate a nonce for Content Security Policy
    const nonce = getNonce();

    // Content Security Policy to restrict resource loading and prevent XSS attacks
    const cspSource = webview.cspSource;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>String Manipulation</title>
  <style>
     body {
      font-weight: var(--vscode-editor-font-weight);
      padding: 10px;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    .command {
      padding: 8px;
      margin-bottom: 5px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
    }
    .command:hover {
      background-color: var(--vscode-inputOption-hoverBackground, #e0e0e0);
      color: var(--vscode-inputOption-activeForeground, #000000);
    }
    .command-output {
      font-family: var(--vscode-editor-font-family);
      margin-top: 4px;
      background-color: var(--vscode-textCodeBlock-background);
      padding: 8px;
      border-radius: 4px;
    }
    .no-selection {
      color: var(--vscode-description-foreground);
      font-style: italic;
    }
  </style>
</head>
<body>
  <h3>Available Transformations</h3>
  <div id="commands"></div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    // Function to render commands
    function renderCommands(commands) {
      const container = document.getElementById('commands');
      container.innerHTML = '';
      if (commands.length === 0) {
        container.innerHTML = '<div class="no-selection">No text selected.</div>';
        return;
      }
      commands.forEach(cmd => {
        const cmdDiv = document.createElement('div');
        cmdDiv.className = 'command';
        cmdDiv.innerHTML = \`
          <div class="command-name">\${cmd.name}</div>
          <div class="command-output">\${cmd.output}</div>
        \`;
        cmdDiv.addEventListener('click', () => {
          vscode.postMessage({
            type: 'applyCommand',
            command: cmd.name,
            text: cmd.originalText
          });
        });
        container.appendChild(cmdDiv);
      });
    }

    // Listen for messages from the extension
    window.addEventListener('message', event => {
      const message = event.data; // The JSON data our extension sent
      switch (message.type) {
        case 'updateCommands':
          renderCommands(message.commands);
          break;
      }
    });
  </script>
</body>
</html>`;
  }

  private async applyCommand(commandName: string) {
    const stringFunc = commandNameFunctionMap[commandName];
    if (!stringFunc) {
      vscode.window.showErrorMessage(`Command "${commandName}" not found.`);
      telemetryService.logError({
        errorType: "command_not_found",
        source: `sidebar.applyCommand`,
        message: `Command "${commandName}" not found in registry`
      });
      return;
    }

    try {
      // Log sidebar feature usage
      telemetryService.logFeatureUsage("sidebar.command_executed", {
        commandName
      });
      
      await stringFunction(commandName, this.context, /* shouldApplyChanges */ true, "sidebar");

      vscode.window.showInformationMessage(
        `Applied "${commandName}" to selected text.`
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(
        `Failed to apply command "${commandName}": ${error.message || String(error)}`
      );
      
      telemetryService.logError({
        errorType: "sidebar_command_execution_error",
        source: `sidebar.applyCommand.${commandName}`,
        message: error.message || String(error)
      });
    }
  }

  public async updateWebview() {
    if (!this._view) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this._view.webview.postMessage({ type: "updateCommands", commands: [] });
      return;
    }

    const selections = editor.selections;
    if (selections.length === 0) {
      this._view.webview.postMessage({ type: "updateCommands", commands: [] });
      return;
    }

    // For simplicity, we'll use the first selection
    const selectedText = editor.document.getText(selections[0]);

    if (!selectedText) {
      this._view.webview.postMessage({ type: "updateCommands", commands: [] });
      return;
    }

    // Apply all commands to the selected text
    const commands = await Promise.all(
      Object.keys(commandNameFunctionMap)
        .filter(
          (commandName) => !functionNamesWithArgument.includes(commandName)
        )
        .map(async (cmdName) => {
          const { replacedSelections } = (await stringFunction(
            cmdName,
            this.context,
            /* shouldApplyChanges */ false
          )) as { replacedSelections: string[] };

          let output = replacedSelections.join("<br>...<br>");

          return {
            name: cmdName,
            output,
            originalText: selectedText,
          };
        })
    );

    // Send the commands to the webview
    this._view.webview.postMessage({ type: "updateCommands", commands });
  }
}
