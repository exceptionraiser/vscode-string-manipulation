import * as vscode from "vscode";
import { TelemetryReporter } from "@vscode/extension-telemetry";

interface CommandTelemetryData {
  commandName: string;
  executionTimeMs?: number;
  selectionCount?: number;
  executionSource?: "command" | "preview" | "sidebar";
  success: boolean;
  errorType?: string;
}

interface ErrorTelemetryData {
  errorType: string;
  source: string;
  message?: string;
}

export class TelemetryService {
  private static _instance: TelemetryService;
  private _reporter: TelemetryReporter | undefined;
  private _isEnabled: boolean = false;

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService._instance) {
      TelemetryService._instance = new TelemetryService();
    }
    return TelemetryService._instance;
  }

  public initialize(context: vscode.ExtensionContext): void {
    // Check if telemetry is enabled in VS Code and extension-specific setting
    this._updateTelemetryState();

    // Listen for changes to VS Code telemetry settings
    vscode.env.onDidChangeTelemetryEnabled(() => {
      this._updateTelemetryState();
    });

    // Listen for changes to extension-specific telemetry setting
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("stringManipulation.telemetry")) {
        this._updateTelemetryState();
      }
    });

    // Initialize reporter if telemetry is enabled
    if (this._isEnabled) {
      this._initializeReporter();
    }
  }

  private _updateTelemetryState(): void {
    const vsCodeTelemetryEnabled = vscode.env.isTelemetryEnabled;
    const extensionTelemetryEnabled = vscode.workspace
      .getConfiguration("stringManipulation")
      .get<boolean>("telemetry", true);

    const newEnabled = vsCodeTelemetryEnabled && extensionTelemetryEnabled;

    if (this._isEnabled !== newEnabled) {
      this._isEnabled = newEnabled;

      if (!newEnabled && this._reporter) {
        this._reporter.dispose();
        this._reporter = undefined;
      } else if (newEnabled && !this._reporter) {
        this._initializeReporter();
      }
    }
  }

  private _initializeReporter(): void {
    // Use Azure Application Insights (recommended by VS Code)
    // TODO: Replace with your actual Application Insights connection string
    const connectionString =
      "InstrumentationKey=3e546a85-0e8c-45b5-8a2c-d528e46ad540;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=3188af51-0f3e-4e08-9b61-7ff14048f384";

    try {
      this._reporter = new TelemetryReporter(connectionString);
    } catch (error) {
      console.warn("Failed to initialize telemetry reporter:", error);
    }
  }

  public logCommandExecution(data: CommandTelemetryData): void {
    if (!this._isEnabled || !this._reporter) {
      return;
    }

    try {
      this._reporter.sendTelemetryEvent(
        "string-manipulation.command.executed",
        {
          commandName: data.commandName,
          executionSource: data.executionSource || "unknown",
          success: data.success.toString(),
          errorType: data.errorType || "",
        },
        {
          executionTimeMs: data.executionTimeMs || 0,
          selectionCount: data.selectionCount || 0,
        }
      );
    } catch (error) {
      console.warn("Failed to send command telemetry:", error);
    }
  }

  public logError(data: ErrorTelemetryData): void {
    if (!this._isEnabled || !this._reporter) {
      return;
    }

    try {
      this._reporter.sendTelemetryErrorEvent("string-manipulation.error", {
        errorType: data.errorType,
        source: data.source,
        message: data.message || "",
      });
    } catch (error) {
      console.warn("Failed to send error telemetry:", error);
    }
  }

  public logFeatureUsage(
    featureName: string,
    properties?: { [key: string]: string }
  ): void {
    if (!this._isEnabled || !this._reporter) {
      return;
    }

    try {
      this._reporter.sendTelemetryEvent("string-manipulation.feature.used", {
        featureName,
        ...properties,
      });
    } catch (error) {
      console.warn("Failed to send feature usage telemetry:", error);
    }
  }

  public dispose(): void {
    if (this._reporter) {
      this._reporter.dispose();
    }
  }
}

// Export singleton instance for easy access
export const telemetryService = TelemetryService.getInstance();
