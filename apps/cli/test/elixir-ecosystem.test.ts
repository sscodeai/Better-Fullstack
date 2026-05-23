import type { VirtualFile, VirtualNode } from "@better-fullstack/template-generator";

import { describe, expect, it } from "bun:test";

import { createVirtual } from "../src/index";
import {
  EcosystemSchema,
  ElixirDatabaseSchema,
  ElixirLibrariesSchema,
  ElixirTestingSchema,
  ElixirWebFrameworkSchema,
} from "../src/types";

function extractEnumValues<T extends string>(schema: { options: readonly T[] }): readonly T[] {
  return schema.options;
}

function findFile(node: VirtualNode, path: string): VirtualFile | undefined {
  if (node.type === "file") {
    const normalizedNodePath = node.path.replace(/^\/+/, "");
    const normalizedPath = path.replace(/^\/+/, "");
    return normalizedNodePath === normalizedPath ? node : undefined;
  }

  for (const child of node.children) {
    const found = findFile(child, path);
    if (found) return found;
  }
  return undefined;
}

function hasFile(node: VirtualNode, path: string): boolean {
  return findFile(node, path) !== undefined;
}

function getFileContent(node: VirtualNode, path: string): string | undefined {
  return findFile(node, path)?.content;
}

describe("Elixir Ecosystem", () => {
  it("exposes Elixir schemas", () => {
    expect(extractEnumValues(EcosystemSchema)).toContain("elixir");
    expect(extractEnumValues(ElixirWebFrameworkSchema)).toEqual(["phoenix", "none"]);
    expect(extractEnumValues(ElixirDatabaseSchema)).toEqual(["ecto", "none"]);
    expect(extractEnumValues(ElixirLibrariesSchema)).toEqual([
      "jason",
      "req",
      "oban",
      "broadway",
      "telemetry",
      "nx",
      "none",
    ]);
    expect(extractEnumValues(ElixirTestingSchema)).toEqual([
      "exunit",
      "mox",
      "stream-data",
      "none",
    ]);
  });

  it("creates a plain Mix / OTP project without Phoenix files", async () => {
    const result = await createVirtual({
      projectName: "plain-elixir",
      ecosystem: "elixir",
      elixirWebFramework: "none",
      elixirDatabase: "none",
      elixirLibraries: ["jason", "req"],
      elixirTesting: ["exunit"],
    });

    expect(result.success).toBe(true);
    const root = result.tree!.root;

    expect(hasFile(root, "mix.exs")).toBe(true);
    expect(hasFile(root, "lib/plain_elixir.ex")).toBe(true);
    expect(hasFile(root, "lib/plain_elixir/application.ex")).toBe(true);
    expect(hasFile(root, "lib/plain_elixir/worker.ex")).toBe(true);
    expect(hasFile(root, "lib/plain_elixir/web/router.ex")).toBe(false);
    expect(hasFile(root, "lib/plain_elixir/repo.ex")).toBe(false);
    expect(hasFile(root, "test/plain_elixir_test.exs")).toBe(true);

    expect(getFileContent(root, "mix.exs")).toContain('app: :plain_elixir');
    expect(getFileContent(root, "mix.exs")).toContain('{:jason, "~> 1.4"}');
    expect(getFileContent(root, "mix.exs")).toContain('{:req, "~> 0.5"}');
  });

  it("creates Phoenix and Ecto files when selected", async () => {
    const result = await createVirtual({
      projectName: "phoenix-api",
      ecosystem: "elixir",
      elixirWebFramework: "phoenix",
      elixirDatabase: "ecto",
      elixirLibraries: ["jason", "oban", "telemetry"],
      elixirTesting: ["exunit", "mox"],
    });

    expect(result.success).toBe(true);
    const root = result.tree!.root;

    expect(hasFile(root, "lib/phoenix_api/repo.ex")).toBe(true);
    expect(hasFile(root, "lib/phoenix_api/web/endpoint.ex")).toBe(true);
    expect(hasFile(root, "lib/phoenix_api/web/router.ex")).toBe(true);
    expect(hasFile(root, "test/support/mox.ex")).toBe(true);
    expect(getFileContent(root, "mix.exs")).toContain('{:phoenix, "~> 1.7"}');
    expect(getFileContent(root, "mix.exs")).toContain('{:ecto_sql, "~> 3.12"}');
    expect(getFileContent(root, "mix.exs")).toContain('{:oban, "~> 2.19"}');
  });
});
