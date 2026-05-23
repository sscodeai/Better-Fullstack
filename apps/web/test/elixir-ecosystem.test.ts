import { describe, expect, it } from "bun:test";

import type { Ecosystem, TechCategory } from "../src/lib/types";

import { getCategoryDisplayName, getVisibleOptions } from "../src/components/stack-builder/utils";
import { DEFAULT_STACK, ECOSYSTEMS, ECOSYSTEM_CATEGORIES, TECH_OPTIONS } from "../src/lib/constant";
import { ELIXIR_CATEGORY_ORDER, generateStackCommand } from "../src/lib/stack-utils";

describe("Elixir Ecosystem Tab", () => {
  it("has elixir as a valid ecosystem value", () => {
    const ecosystems: Ecosystem[] = [
      "typescript",
      "react-native",
      "rust",
      "python",
      "go",
      "java",
      "elixir",
    ];

    expect(ecosystems).toContain("elixir");
  });

  it("registers Elixir in ecosystem constants", () => {
    const elixirEcosystem = ECOSYSTEMS.find((ecosystem) => ecosystem.id === "elixir");

    expect(ECOSYSTEMS).toHaveLength(7);
    expect(elixirEcosystem).toBeDefined();
    expect(elixirEcosystem?.name).toBe("Elixir");
    expect(elixirEcosystem?.description).toContain("Mix");
  });

  it("exposes Elixir-specific categories", () => {
    const categories = ECOSYSTEM_CATEGORIES.elixir;

    expect(categories).toContain("elixirWebFramework");
    expect(categories).toContain("elixirDatabase");
    expect(categories).toContain("elixirLibraries");
    expect(categories).toContain("elixirTesting");
    expect(categories).toContain("git");
    expect(categories).toContain("install");
    expect(ELIXIR_CATEGORY_ORDER).toEqual(categories);
  });

  it("has options for every Elixir category", () => {
    const categories: TechCategory[] = [
      "elixirWebFramework",
      "elixirDatabase",
      "elixirLibraries",
      "elixirTesting",
    ];

    for (const category of categories) {
      const options = TECH_OPTIONS[category];
      expect(options.length).toBeGreaterThan(0);
      expect(options.some((option) => option.id === "none")).toBe(true);
      expect(typeof getCategoryDisplayName(category)).toBe("string");
    }
  });

  it("defaults to plain Mix / OTP with Jason and ExUnit", () => {
    expect(DEFAULT_STACK.elixirWebFramework).toBe("none");
    expect(DEFAULT_STACK.elixirDatabase).toBe("none");
    expect(DEFAULT_STACK.elixirLibraries).toEqual(["jason"]);
    expect(DEFAULT_STACK.elixirTesting).toEqual(["exunit"]);
  });

  it("generates Elixir command flags", () => {
    const command = generateStackCommand({
      ...DEFAULT_STACK,
      ecosystem: "elixir",
      projectName: "beam-service",
      elixirWebFramework: "phoenix",
      elixirDatabase: "ecto",
      elixirLibraries: ["jason", "oban"],
      elixirTesting: ["exunit", "mox"],
    });

    expect(command).toContain("--ecosystem elixir");
    expect(command).toContain("--elixir-web-framework phoenix");
    expect(command).toContain("--elixir-database ecto");
    expect(command).toContain("--elixir-libraries jason oban");
    expect(command).toContain("--elixir-testing exunit mox");
  });

  it("keeps Elixir options visible for the Elixir ecosystem", () => {
    const visibleOptions = getVisibleOptions(
      { ...DEFAULT_STACK, ecosystem: "elixir" },
      "elixirWebFramework",
      TECH_OPTIONS.elixirWebFramework,
    );

    expect(visibleOptions.map((option) => option.id)).toEqual(["none", "phoenix"]);
  });
});
