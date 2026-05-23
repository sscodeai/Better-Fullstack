# Elixir Ecosystem Expansion

Strong differentiator — no competing scaffolding tool covers Elixir well. Phoenix LiveView is unique, but the ecosystem should not be Phoenix-only. Plain Mix projects, OTP applications, libraries, workers, CLI tools, and BEAM-native services are all valuable scaffold targets.

---

## Web Framework

- [ ] Add `none` — plain Mix / OTP application without Phoenix.
  - `mix new`-style application structure
  - Supervision tree and application callback when useful
  - Optional CLI entrypoint via `escript`
  - Suitable for libraries, workers, services, Broadway pipelines, Nerves-adjacent foundations, and non-HTTP BEAM apps
- [ ] Add `phoenix` — dominant Elixir web framework.
  - LiveView for reactive server-rendered UI
  - Channels for WebSocket-based realtime
  - Built-in generators (`mix phx.gen.auth`, `mix phx.gen.live`, etc.)
  - HEEx templates (HTML + Elixir expressions)

Phoenix should be the rich web default, not the only valid Elixir target. The builder must allow "No Web Framework" for Elixir once the ecosystem ships.

---

## Database / ORM

- [ ] Add `ecto` — database layer for Phoenix and non-Phoenix Mix apps. Changesets for validation, migrations, multi-repo support.
  - Supports PostgreSQL, MySQL, SQLite, MSSQL via adapters
  - Query composition via `Ecto.Query`
  - Schema-less queries for flexibility

---

## Realtime

Phoenix has built-in realtime primitives, while non-Phoenix apps can use BEAM/OTP primitives directly:
- **Phoenix Channels** — WebSocket-based pub/sub, presence tracking
- **LiveView** — server-rendered reactive components, no JS framework needed
- **LiveView Streams** — efficient list rendering for large datasets
- **GenServer / Registry / PubSub** — process-based coordination for non-web applications

---

## Authentication

- [ ] Add `phx_gen_auth` — built-in Phoenix auth generator. Email/password, session-based, secure defaults.
- [ ] Add `ueberauth` — OAuth/social login strategies. Pluggable architecture (GitHub, Google, Twitter, etc.).
- [ ] Add `guardian` — JWT-based auth. Token generation, refresh, revocation.

`phx_gen_auth` must be Phoenix-gated. `guardian` and some `ueberauth` flows can apply to non-Phoenix HTTP stacks later, but should start disabled for `elixirWebFramework: "none"` until templates exist.

---

## Task Queues

- [ ] Add `oban` — de facto standard for background jobs. PostgreSQL-backed, cron scheduling, unique jobs, priorities, rate limiting. Pro version adds Web UI.

---

## API Styles

- [ ] Add `absinthe` — GraphQL toolkit for Elixir. Schema-first, subscriptions, dataloader for N+1 prevention.
- [ ] Add `grpc` (via `grpc-elixir`) — Protocol Buffers-based RPC.
- [ ] REST is default via Phoenix controllers/routers.
- [ ] Add `bandit` / `plug` consideration — lightweight HTTP without Phoenix if the ecosystem later needs a middle ground between `none` and Phoenix.

---

## Testing

- [ ] `exunit` — built-in test framework. Doctests, async tests, property-based testing via StreamData.
- [ ] Add `mox` — mock library following José Valim's "Mocks and explicit contracts" pattern.
- [ ] Add `wallaby` — browser-based integration testing (like Playwright for Elixir).

---

## Observability

- [ ] Add `telemetry` — built-in instrumentation library. Phoenix, Ecto, and most libraries emit telemetry events.
- [ ] Add `opentelemetry-erlang` — distributed tracing for BEAM.
- [ ] Add `prometheus_ex` — Prometheus metrics exporter.

---

## Deployment

- [ ] Add `fly.io` — first-class Elixir/Phoenix support, clustering via DNS.
- [ ] Add `docker` — multi-stage Dockerfile with `mix release`.
- [ ] Add `gigalixir` — Elixir-specific PaaS (Heroku-like but BEAM-optimized).

---

## Libraries / Utilities

- [ ] Add `jason` — fast JSON encoder/decoder (default in Phoenix).
- [ ] Add `req` — modern HTTP client (replaces HTTPoison).
- [ ] Add `broadway` — data ingestion / stream processing (Kafka, SQS, RabbitMQ).
- [ ] Add `nx` (Numerical Elixir) — tensors, ML, GPU computing on BEAM.

---

## Implementation Notes

- New schema value in `EcosystemSchema`: `"elixir"`
- New schema value set for `ElixirWebFrameworkSchema`: `["phoenix", "none"]`
- Template directory: `packages/template-generator/templates/elixir-base/`
- Base project structure: `mix.exs`, `lib/`, `config/`, `test/`
- Phoenix project structure: add `assets/`, `priv/`, web modules, endpoint/router/live directories, and Phoenix-specific config only when `elixirWebFramework === "phoenix"`
- Mix project with optional umbrella app support (monorepo equivalent)
- Build system: Mix (built-in, no choice needed)
- Package manager: Hex
- Elixir 1.17+ / OTP 27+ as default
- Compatibility must not disable `elixirWebFramework: "none"` just because Phoenix templates exist first.

### Challenges
- Phoenix has its own project structure conventions (different from all other ecosystems)
- Mix-based build system requires different template generation approach
- LiveView is unique — no equivalent concept in other ecosystems
- BEAM deployment (releases) has specific requirements (runtime config, clustering)
- Umbrella apps are Elixir's monorepo pattern — different from Turborepo/Nx
- Non-Phoenix scaffolds must still be useful, not empty shells. Include a small supervised worker, tests, README commands, and release-friendly config.

---

## Priority Order

1. **Plain Mix / OTP (`none`)** — proves Elixir is broader than Phoenix and gives the builder a valid "No Web Framework" path
2. **Phoenix** + Ecto + PostgreSQL — core web stack
3. **Oban** — useful in both Phoenix and non-Phoenix apps
4. **phx_gen_auth** — Phoenix-gated auth
5. **Absinthe** — GraphQL (unique strength in Elixir)
6. **LiveView scaffolding** — the killer feature
7. **Fly.io deploy** — best Elixir hosting
8. Remaining categories
