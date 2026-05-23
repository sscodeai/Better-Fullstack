import { describe, expect, it } from "bun:test";

import { VirtualFileSystem } from "../../src/core/virtual-fs";
import { processElixirBaseTemplate } from "../../src/template-handlers/elixir-base";
import { makeConfig } from "../_fixtures/config-factory";
import { makeTemplates } from "../_fixtures/template-factory";

const ELIXIR_TEMPLATES = {
  "elixir-base/mix.exs.hbs":
    "defmodule {{elixirModuleName}}.MixProject do {{#if isElixirPhoenix}}phoenix{{/if}}{{#if hasElixirJason}}jason{{/if}} end",
  "elixir-base/config/config.exs.hbs": "config :{{elixirOtpApp}}",
  "elixir-base/lib/__elixir_app_name__.ex.hbs": "defmodule {{elixirModuleName}} do end",
  "elixir-base/lib/__elixir_app_name__/application.ex.hbs":
    "defmodule {{elixirModuleName}}.Application do end",
  "elixir-base/lib/__elixir_app_name__/worker.ex.hbs":
    "defmodule {{elixirModuleName}}.Worker do end",
  "elixir-base/lib/__elixir_app_name__/repo.ex.hbs":
    "defmodule {{elixirModuleName}}.Repo do end",
  "elixir-base/lib/__elixir_app_name__/web/router.ex.hbs":
    "defmodule {{elixirModuleName}}Web.Router do end",
  "elixir-base/test/test_helper.exs.hbs": "ExUnit.start()",
  "elixir-base/test/__elixir_app_name___test.exs.hbs": "defmodule {{elixirModuleName}}Test do end",
};

describe("processElixirBaseTemplate", () => {
  it("returns early when ecosystem is not elixir", async () => {
    const vfs = new VirtualFileSystem();
    await processElixirBaseTemplate(
      vfs,
      makeTemplates(ELIXIR_TEMPLATES),
      makeConfig({ ecosystem: "typescript" }),
    );
    expect(vfs.getFileCount()).toBe(0);
  });

  it("emits a plain Mix / OTP scaffold when elixirWebFramework is none", async () => {
    const vfs = new VirtualFileSystem();
    await processElixirBaseTemplate(
      vfs,
      makeTemplates(ELIXIR_TEMPLATES),
      makeConfig({
        projectName: "my-elixir-app",
        ecosystem: "elixir",
        elixirWebFramework: "none",
        elixirDatabase: "none",
        elixirLibraries: ["jason"],
        elixirTesting: ["exunit"],
      }),
    );

    expect(vfs.exists("mix.exs")).toBe(true);
    expect(vfs.exists("lib/my_elixir_app.ex")).toBe(true);
    expect(vfs.exists("lib/my_elixir_app/application.ex")).toBe(true);
    expect(vfs.exists("lib/my_elixir_app/worker.ex")).toBe(true);
    expect(vfs.exists("lib/my_elixir_app/web/router.ex")).toBe(false);
    expect(vfs.exists("lib/my_elixir_app/repo.ex")).toBe(false);
    expect(vfs.exists("test/my_elixir_app_test.exs")).toBe(true);
    expect(vfs.readFile("mix.exs")).toContain("jason");
    expect(vfs.readFile("lib/my_elixir_app.ex")).toContain("defmodule MyElixirApp");
  });

  it("adds Phoenix and Ecto-specific files when selected", async () => {
    const vfs = new VirtualFileSystem();
    await processElixirBaseTemplate(
      vfs,
      makeTemplates(ELIXIR_TEMPLATES),
      makeConfig({
        projectName: "phx-service",
        ecosystem: "elixir",
        elixirWebFramework: "phoenix",
        elixirDatabase: "ecto",
        elixirLibraries: ["jason", "telemetry"],
        elixirTesting: [],
      }),
    );

    expect(vfs.exists("mix.exs")).toBe(true);
    expect(vfs.exists("lib/phx_service/repo.ex")).toBe(true);
    expect(vfs.exists("lib/phx_service/web/router.ex")).toBe(true);
    expect(vfs.exists("test/phx_service_test.exs")).toBe(false);
    expect(vfs.readFile("mix.exs")).toContain("phoenix");
    expect(vfs.readFile("lib/phx_service/web/router.ex")).toContain("defmodule PhxServiceWeb.Router");
  });
});
