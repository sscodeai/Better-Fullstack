import type {
  ElixirDatabase,
  ElixirLibraries,
  ElixirTesting,
  ElixirWebFramework,
} from "../types";

import { exitCancelled } from "../utils/errors";
import { isCancel, navigableMultiselect, navigableSelect } from "./navigable";
import {
  createStaticMultiPromptResolution,
  createStaticSinglePromptResolution,
  type PromptOption,
} from "./prompt-contract";

const ELIXIR_WEB_FRAMEWORK_PROMPT_OPTIONS: PromptOption<ElixirWebFramework>[] = [
  {
    value: "none",
    label: "None",
    hint: "Plain Mix / OTP application without Phoenix",
  },
  {
    value: "phoenix",
    label: "Phoenix",
    hint: "Full-featured Elixir web framework with LiveView and Channels",
  },
];

const ELIXIR_DATABASE_PROMPT_OPTIONS: PromptOption<ElixirDatabase>[] = [
  {
    value: "none",
    label: "None",
    hint: "No Elixir database layer",
  },
  {
    value: "ecto",
    label: "Ecto",
    hint: "Database wrapper and query generator for Elixir",
  },
];

const ELIXIR_LIBRARY_PROMPT_OPTIONS: PromptOption<ElixirLibraries>[] = [
  {
    value: "jason",
    label: "Jason",
    hint: "Fast JSON encoder and decoder",
  },
  {
    value: "req",
    label: "Req",
    hint: "Modern HTTP client for Elixir",
  },
  {
    value: "oban",
    label: "Oban",
    hint: "PostgreSQL-backed background jobs",
  },
  {
    value: "broadway",
    label: "Broadway",
    hint: "Concurrent data ingestion and processing pipelines",
  },
  {
    value: "telemetry",
    label: "Telemetry",
    hint: "Instrumentation events and metrics foundation",
  },
  {
    value: "nx",
    label: "Nx",
    hint: "Numerical Elixir tensors and machine learning",
  },
  {
    value: "none",
    label: "None",
    hint: "No extra Elixir libraries",
  },
];

const ELIXIR_TESTING_PROMPT_OPTIONS: PromptOption<ElixirTesting>[] = [
  {
    value: "exunit",
    label: "ExUnit",
    hint: "Built-in Elixir test framework",
  },
  {
    value: "mox",
    label: "Mox",
    hint: "Explicit contract-based mocks",
  },
  {
    value: "stream-data",
    label: "StreamData",
    hint: "Property-based testing for ExUnit",
  },
  {
    value: "none",
    label: "None",
    hint: "No extra Elixir testing setup",
  },
];

export function resolveElixirWebFrameworkPrompt(elixirWebFramework?: ElixirWebFramework) {
  return createStaticSinglePromptResolution(
    ELIXIR_WEB_FRAMEWORK_PROMPT_OPTIONS,
    "none",
    elixirWebFramework,
  );
}

export async function getElixirWebFrameworkChoice(
  elixirWebFramework?: ElixirWebFramework,
) {
  const resolution = resolveElixirWebFrameworkPrompt(elixirWebFramework);
  if (!resolution.shouldPrompt) {
    return resolution.autoValue ?? "none";
  }

  const response = await navigableSelect<ElixirWebFramework>({
    message: "Select Elixir web framework",
    options: resolution.options,
    initialValue: resolution.initialValue as ElixirWebFramework,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");
  return response;
}

export function resolveElixirDatabasePrompt(elixirDatabase?: ElixirDatabase) {
  return createStaticSinglePromptResolution(
    ELIXIR_DATABASE_PROMPT_OPTIONS,
    "none",
    elixirDatabase,
  );
}

export async function getElixirDatabaseChoice(elixirDatabase?: ElixirDatabase) {
  const resolution = resolveElixirDatabasePrompt(elixirDatabase);
  if (!resolution.shouldPrompt) {
    return resolution.autoValue ?? "none";
  }

  const response = await navigableSelect<ElixirDatabase>({
    message: "Select Elixir database layer",
    options: resolution.options,
    initialValue: resolution.initialValue as ElixirDatabase,
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");
  return response;
}

export function resolveElixirLibrariesPrompt(elixirLibraries?: ElixirLibraries[]) {
  return createStaticMultiPromptResolution(
    ELIXIR_LIBRARY_PROMPT_OPTIONS,
    ["jason"],
    elixirLibraries,
  );
}

export async function getElixirLibrariesChoice(elixirLibraries?: ElixirLibraries[]) {
  const resolution = resolveElixirLibrariesPrompt(elixirLibraries);
  if (!resolution.shouldPrompt) {
    return (resolution.autoValue as ElixirLibraries[]) ?? [];
  }

  const response = await navigableMultiselect({
    message: "Select Elixir libraries",
    options: resolution.options,
    required: false,
    initialValues: resolution.initialValue as ElixirLibraries[],
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");
  if (response.includes("none")) return [];
  return response as ElixirLibraries[];
}

export function resolveElixirTestingPrompt(elixirTesting?: ElixirTesting[]) {
  return createStaticMultiPromptResolution(
    ELIXIR_TESTING_PROMPT_OPTIONS,
    ["exunit"],
    elixirTesting,
  );
}

export async function getElixirTestingChoice(elixirTesting?: ElixirTesting[]) {
  const resolution = resolveElixirTestingPrompt(elixirTesting);
  if (!resolution.shouldPrompt) {
    return (resolution.autoValue as ElixirTesting[]) ?? [];
  }

  const response = await navigableMultiselect({
    message: "Select Elixir testing libraries",
    options: resolution.options,
    required: false,
    initialValues: resolution.initialValue as ElixirTesting[],
  });

  if (isCancel(response)) return exitCancelled("Operation cancelled");
  if (response.includes("none")) return [];
  return response as ElixirTesting[];
}
