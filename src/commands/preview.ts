import * as vscode from "vscode";
import { commandNameFunctionMap } from "./index";
import { functionNamesWithArgument, numberFunctionNames } from "./types";
import { stringFunction } from "./index";
import { telemetryService } from "../telemetry";

/**
 * Maximum length for preview text in context menu
 */
const MAX_PREVIEW_LENGTH = 30;

/**
 * Truncates a string to a maximum length and adds ellipsis if needed
 */
export function truncateForPreview(
  text: string,
  maxLength = MAX_PREVIEW_LENGTH
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Gets a preview of the transformation for the selected text
 */
export function getTransformationPreview(
  commandName: string,
  selectedText: string
): string | undefined {
  if (!selectedText || selectedText.trim() === "") {
    return undefined;
  }

  // Skip preview for functions that require user input
  if (functionNamesWithArgument.includes(commandName)) {
    return undefined;
  }

  // Skip preview for special functions that don't work well with simple previews
  if (
    commandName === "duplicateAndIncrement" ||
    commandName === "duplicateAndDecrement" ||
    commandName === "sequence"
  ) {
    return undefined;
  }

  try {
    let stringFunc: (str: string) => string;

    if (numberFunctionNames.includes(commandName)) {
      stringFunc = (str: string) =>
        (commandNameFunctionMap[commandName] as Function)(str, {});
    } else {
      stringFunc = commandNameFunctionMap[commandName] as (
        str: string
      ) => string;
    }

    // Get the first line of text for preview
    const firstLine = selectedText.split("\n")[0];
    const transformed = stringFunc(firstLine);

    return truncateForPreview(transformed);
  } catch (error: any) {
    console.error(`Error generating preview for ${commandName}:`, error);
    telemetryService.logError({
      errorType: "preview_generation_error",
      source: `getTransformationPreview.${commandName}`,
      message: error.message || String(error)
    });
    return undefined;
  }
}

// Extended QuickPickItem interface to include the command name
interface TransformationQuickPickItem extends vscode.QuickPickItem {
  commandName: string;
}

/**
 * Shows a quick pick menu with previews of all transformations
 */
export async function showTransformationQuickPick(
  context: vscode.ExtensionContext
): Promise<void> {
  // Log preview feature usage
  telemetryService.logFeatureUsage("preview.opened");
  
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selections.length === 0) {
    vscode.window.showInformationMessage("No text selected");
    telemetryService.logFeatureUsage("preview.no_selection");
    return;
  }

  // Get the selected text
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  if (!selectedText || selectedText.trim() === "") {
    vscode.window.showInformationMessage("No text selected");
    telemetryService.logFeatureUsage("preview.no_selection");
    return;
  }

  // Create quick pick items with previews
  const quickPickItems: TransformationQuickPickItem[] = [];

  for (const commandName of Object.keys(commandNameFunctionMap)) {
    try {
      const preview = getTransformationPreview(commandName, selectedText);

      // Format the command name for display
      const displayName = commandName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

      // Create the quick pick item
      const item: TransformationQuickPickItem = {
        label: displayName,
        description: preview ? `→ ${preview}` : undefined,
        detail: preview ? "Preview of transformation" : "No preview available",
        commandName: commandName, // Store the actual command name
      };

      quickPickItems.push(item);
    } catch (error: any) {
      console.error(
        `Error creating quick pick item for ${commandName}:`,
        error
      );
      telemetryService.logError({
        errorType: "quickpick_item_error",
        source: `showTransformationQuickPick.${commandName}`,
        message: error.message || String(error)
      });
    }
  }

  // Show the quick pick
  const selectedItem = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: "Select a string transformation (with preview)",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (selectedItem) {
    try {
      // Log preview feature usage
      telemetryService.logFeatureUsage("preview.command_selected", {
        commandName: selectedItem.commandName
      });
      
      // Use the stored command name directly
      await stringFunction(selectedItem.commandName, context, true, "preview");
    } catch (error: any) {
      console.error("Error applying transformation:", error);
      vscode.window.showErrorMessage(
        `Failed to apply transformation: ${error.message || String(error)}`
      );
      
      telemetryService.logError({
        errorType: "preview_command_execution_error",
        source: `showTransformationQuickPick.${selectedItem.commandName}`,
        message: error.message || String(error)
      });
    }
  } else {
    // Log preview cancellation
    telemetryService.logFeatureUsage("preview.cancelled");
  }
}

/**
 * Registers the command to show the transformation quick pick
 */
export function registerPreviewCommand(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand(
    "string-manipulation.showTransformationsWithPreview",
    () => showTransformationQuickPick(context)
  );

  context.subscriptions.push(command);
}
