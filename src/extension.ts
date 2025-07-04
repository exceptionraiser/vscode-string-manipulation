import * as vscode from "vscode";
import { StringManipulationSidebar } from "./sidebar";
import { activate as stringManipulationActivate } from "./commands/index";
import { registerPreviewCommand } from "./commands/preview";
import { telemetryService } from "./telemetry";

export function activate(context: vscode.ExtensionContext) {
  // Initialize telemetry service
  telemetryService.initialize(context);
  context.subscriptions.push({ dispose: () => telemetryService.dispose() });

  stringManipulationActivate(context);

  // Register command to show transformations with previews
  registerPreviewCommand(context);

  const sidebarProvider = new StringManipulationSidebar(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      StringManipulationSidebar.viewType,
      sidebarProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Update the sidebar initially
  sidebarProvider.updateWebview();

  // Log extension activation
  telemetryService.logFeatureUsage("extension.activated");
}

export function deactivate() {}
