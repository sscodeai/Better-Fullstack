import type { ProjectConfig } from "@better-fullstack/types";

import type { VirtualFileSystem } from "../core/virtual-fs";
import type { TemplateData } from "./utils";

import { isBinaryFile, processTemplateString, transformFilename } from "../core/template-processor";

type ElixirTemplateContext = ProjectConfig & {
  elixirAppName: string;
  elixirModuleName: string;
  elixirOtpApp: string;
  isElixirPhoenix: boolean;
  isElixirPlainOtp: boolean;
  hasElixirEcto: boolean;
  hasElixirJason: boolean;
  hasElixirReq: boolean;
  hasElixirOban: boolean;
  hasElixirBroadway: boolean;
  hasElixirTelemetry: boolean;
  hasElixirNx: boolean;
  hasElixirExUnit: boolean;
  hasElixirMox: boolean;
  hasElixirStreamData: boolean;
};

const ELIXIR_RESERVED_WORDS = new Set([
  "after",
  "and",
  "catch",
  "do",
  "else",
  "end",
  "fn",
  "in",
  "not",
  "or",
  "rescue",
  "true",
  "false",
  "nil",
  "when",
]);

function sanitizeElixirAppName(projectName: string): string {
  let sanitized = "";
  let pendingSeparator = false;

  for (const char of projectName.trim().toLowerCase()) {
    const code = char.charCodeAt(0);
    const isLowercaseLetter = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    if (isLowercaseLetter || isDigit) {
      if (pendingSeparator && sanitized.length > 0) {
        sanitized += "_";
      }
      sanitized += char;
      pendingSeparator = false;
      continue;
    }

    if (sanitized.length > 0) {
      pendingSeparator = true;
    }
  }

  if (sanitized.length === 0) return "app";

  const firstCode = sanitized.charCodeAt(0);
  const startsWithLetter = firstCode >= 97 && firstCode <= 122;
  const withPrefix = startsWithLetter ? sanitized : `app_${sanitized}`;
  const guarded = ELIXIR_RESERVED_WORDS.has(withPrefix) ? `app_${withPrefix}` : withPrefix;
  return guarded;
}

function toElixirModuleName(appName: string): string {
  return appName
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function createElixirTemplateContext(config: ProjectConfig): ElixirTemplateContext {
  const elixirAppName = sanitizeElixirAppName(config.projectName);
  const libraries = new Set((config.elixirLibraries || []).filter((library) => library !== "none"));
  const testing = new Set((config.elixirTesting || []).filter((library) => library !== "none"));

  return {
    ...config,
    elixirAppName,
    elixirModuleName: toElixirModuleName(elixirAppName),
    elixirOtpApp: elixirAppName,
    isElixirPhoenix: config.elixirWebFramework === "phoenix",
    isElixirPlainOtp: config.elixirWebFramework !== "phoenix",
    hasElixirEcto: config.elixirDatabase === "ecto",
    hasElixirJason: libraries.has("jason"),
    hasElixirReq: libraries.has("req"),
    hasElixirOban: libraries.has("oban"),
    hasElixirBroadway: libraries.has("broadway"),
    hasElixirTelemetry: libraries.has("telemetry"),
    hasElixirNx: libraries.has("nx"),
    hasElixirExUnit: testing.has("exunit"),
    hasElixirMox: testing.has("mox"),
    hasElixirStreamData: testing.has("stream-data"),
  };
}

function shouldSkipElixirTemplate(templatePath: string, context: ElixirTemplateContext): boolean {
  if (!context.isElixirPhoenix && templatePath.includes("/web/")) return true;
  if (!context.hasElixirEcto && templatePath.includes("/repo.ex.hbs")) return true;
  if (!context.hasElixirExUnit && templatePath.includes("/test/")) return true;
  if (!context.hasElixirMox && templatePath.endsWith("/test/support/mox.ex.hbs")) return true;
  return false;
}

function transformElixirOutputPath(relativePath: string, context: ElixirTemplateContext): string {
  return transformFilename(relativePath.replace(/__elixir_app_name__/g, context.elixirAppName));
}

export async function processElixirBaseTemplate(
  vfs: VirtualFileSystem,
  templates: TemplateData,
  config: ProjectConfig,
): Promise<void> {
  if (config.ecosystem !== "elixir") return;

  const prefix = "elixir-base/";
  const context = createElixirTemplateContext(config);

  for (const [templatePath, content] of templates) {
    if (!templatePath.startsWith(prefix)) continue;
    if (shouldSkipElixirTemplate(templatePath, context)) continue;

    const relativePath = templatePath.slice(prefix.length);
    const outputPath = transformElixirOutputPath(relativePath, context);

    let processedContent: string;
    if (isBinaryFile(templatePath)) {
      processedContent = "[Binary file]";
    } else if (templatePath.endsWith(".hbs")) {
      processedContent = processTemplateString(content, context as ProjectConfig);
    } else {
      processedContent = content;
    }

    if (!isBinaryFile(templatePath) && processedContent.trim() === "") continue;

    const sourcePath = isBinaryFile(templatePath) ? templatePath : undefined;
    vfs.writeFile(outputPath, processedContent, sourcePath);
  }
}
