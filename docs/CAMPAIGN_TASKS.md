# GrantFox Campaign Tasks — GuildPass Integrations <!-- IC: 242 -->

This document lists tasks that are suitable for **GrantFox campaign contributions**. Each task is scoped, actionable, and ready for contributors to pick up. <!-- IC: 243 -->

Maintainers: ensure each task listed here has a corresponding GitHub issue tagged `good first issue` or `help wanted`. <!-- IC: 244 -->

--- <!-- IC: 245 -->

## 🟢 Ready to Contribute <!-- IC: 246 -->

### TASK-INT-001: Add a `/ping` health-check slash command <!-- IC: 247 -->
- **Difficulty**: Easy <!-- IC: 248 -->
- **Labels**: `good first issue`, `discord-bot` <!-- IC: 249 -->
- **Description**: Add a `/ping` slash command that responds with the bot's uptime and the current connection status to `guildpass-core`. <!-- IC: 250 -->
- **Files to change**: `apps/discord-bot/src/commands/` <!-- IC: 251 -->
- **Acceptance criteria**: <!-- IC: 252 -->
  - Command registered and visible in Discord <!-- IC: 253 -->
  - Response includes uptime in a human-readable format <!-- IC: 254 -->
  - Returns an error message if core is unreachable <!-- IC: 255 -->
- **Tests**: Bot starts; `/ping` responds in under 2 seconds <!-- IC: 256 -->
- **Reviewer expectations**: TypeScript, error handling, follows existing command structure <!-- IC: 257 -->

--- <!-- IC: 258 -->

### TASK-INT-002: Write unit tests for the integration-client package <!-- IC: 259 -->
- **Difficulty**: Easy–Medium <!-- IC: 260 -->
- **Labels**: `good first issue`, `tests`, `integration-client` <!-- IC: 261 -->
- **Description**: The `packages/integration-client` package currently has no test coverage. Add unit tests using a mocked HTTP client. <!-- IC: 262 -->
- **Files to change**: `packages/integration-client/src/`, add `packages/integration-client/tests/` <!-- IC: 263 -->
- **Acceptance criteria**: <!-- IC: 264 -->
  - At least one test per exported function <!-- IC: 265 -->
  - Tests mock HTTP responses — no live calls to core <!-- IC: 266 -->
  - Tests run with `npm run test` (or equivalent per package) <!-- IC: 267 -->
- **Tests**: `npm run test` passes <!-- IC: 268 -->
- **Reviewer expectations**: Clear test names, mock isolation, no real network calls <!-- IC: 269 -->

--- <!-- IC: 270 -->

### TASK-INT-003: Improve the Docusaurus docs home page <!-- IC: 271 -->
- **Difficulty**: Easy
- **Labels**: `good first issue`, `documentation`, `docs-site`
- **Description**: The Docusaurus docs site home page is sparse. Update it to include a clear introduction to GuildPass, a quick-start link, and links to the SDK and core repos.
- **Files to change**: `apps/docs/docs/intro.md` and/or `apps/docs/src/pages/index.tsx`
- **Acceptance criteria**:
  - Home page has a one-paragraph description of GuildPass
  - Links to quick-start, SDK docs, and GitHub repos
  - Renders correctly (`npm run dev:docs`)
- **Tests**: Docusaurus builds without errors (`npm run build:docs`)
- **Reviewer expectations**: Clean markdown/MDX, no broken links

---

### TASK-INT-004: Add webhook signature verification to webhook-utils
- **Difficulty**: Medium
- **Labels**: `help wanted`, `integration-client`
- **Description**: The `packages/webhook-utils` package currently has only stubs. Implement HMAC-SHA256 signature verification for incoming webhooks from `guildpass-core`.
- **Files to change**: `packages/webhook-utils/src/`
- **Acceptance criteria**:
  - `verifySignature(payload, signature, secret)` function exported
  - Unit tests covering valid and invalid signatures
  - TypeScript types exported
- **Tests**: `npm run test` in the webhook-utils package passes
- **Reviewer expectations**: Use Node's built-in `crypto` module, no extra dependencies

---

### TASK-INT-005: Add a CI workflow for type-checking
- **Difficulty**: Easy
- **Labels**: `good first issue`, `tests`
- **Description**: There is no CI workflow in this repo. Add a GitHub Actions workflow that runs `npm run typecheck` on every push and PR to `main`.
- **Files to change**: `.github/workflows/typecheck.yml` (new file)
- **Acceptance criteria**:
  - Workflow runs on `push` and `pull_request` targeting `main`
  - Uses `actions/setup-node` with Node 18
  - `npm install` and `npm run typecheck` steps
- **Tests**: Workflow passes on a draft PR
- **Reviewer expectations**: Clean YAML, correct trigger events

---

## 🟡 Planned (not yet open)

- Add `eslint` configuration and enforce via CI
- Add `/guild-stats` command to display aggregate membership numbers
- Implement role sync scheduling (cron-based)
- Docusaurus versioned docs for API changes

---

*To apply for a task, visit [GrantFox](https://contribute.grantfox.xyz) or comment on the linked GitHub issue.*
