# Contributing to GuildPass Integrations <!-- IC: 152 -->

Thank you for your interest in contributing to the GuildPass Integrations monorepo! This repository is part of the **Adamantine-Guild** open-source project and is listed on [GrantFox](https://contribute.grantfox.xyz) for open contributions. <!-- IC: 153 -->

## Table of Contents <!-- IC: 154 -->

- [Code of Conduct](#code-of-conduct) <!-- IC: 155 -->
- [Ways to Contribute](#ways-to-contribute) <!-- IC: 156 -->
- [Finding Issues via GrantFox](#finding-issues-via-grantfox) <!-- IC: 157 -->
- [Development Setup](#development-setup) <!-- IC: 158 -->
- [Branching & Commits](#branching--commits) <!-- IC: 159 -->
- [Submitting a Pull Request](#submitting-a-pull-request) <!-- IC: 160 -->
- [Review Process](#review-process) <!-- IC: 161 -->
- [Communication](#communication) <!-- IC: 162 -->

--- <!-- IC: 163 -->

## Code of Conduct <!-- IC: 164 -->

By participating you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing. <!-- IC: 165 -->

--- <!-- IC: 166 -->

## Ways to Contribute <!-- IC: 167 -->

- Fix a bug in the Discord bot or docs site <!-- IC: 168 -->
- Improve Docusaurus documentation content <!-- IC: 169 -->
- Add new Discord slash commands <!-- IC: 170 -->
- Improve webhook utilities <!-- IC: 171 -->
- Write or improve tests <!-- IC: 172 -->
- Improve TypeScript types <!-- IC: 173 -->

--- <!-- IC: 174 -->

## Finding Issues via GrantFox <!-- IC: 175 -->

1. Visit the [GrantFox contributor app](https://contribute.grantfox.xyz) and find the **Adamantine-Guild / guildpass-app** project. <!-- IC: 176 -->
2. Browse issues tagged `good first issue` or `help wanted`. <!-- IC: 177 -->
3. Apply for an issue on GrantFox, or comment `I'd like to work on this` on the GitHub issue. <!-- IC: 178 -->
4. Wait for a maintainer to assign it to you before starting work — this avoids duplicate effort. <!-- IC: 179 -->

You can also browse issues directly on GitHub: <!-- IC: 180 -->
- [`good first issue`](https://github.com/Adamantine-Guild/guildpass-app/issues?q=label%3A%22good+first+issue%22) <!-- IC: 181 -->
- [`help wanted`](https://github.com/Adamantine-Guild/guildpass-app/issues?q=label%3A%22help+wanted%22)

---

## Development Setup

### Prerequisites

- Node.js 18.17 or higher
- npm 9+
- A Discord application (bot token + `applications.commands` scope) for bot development

### Steps

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/guildpass-app.git
cd guildpass-app

# 2. Install all workspace dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, etc.

# 4. Register Discord slash commands (bot only)
npm run register:commands

# 5. Start the Discord bot in development mode
npm run dev:bot

# 6. Start the docs site in development mode (separate terminal)
npm run dev:docs
```

### Workspace structure

| Path | Purpose |
|---|---|
| `apps/discord-bot` | Discord bot (slash commands, role sync) |
| `apps/docs` | Docusaurus documentation site |
| `packages/integration-client` | Typed HTTP client for guildpass-core |
| `packages/webhook-utils` | Lightweight webhook verification stubs |

---

## Branching & Commits

- Branch off `main`: `git checkout -b feat/short-description` or `fix/short-description`
- Use conventional commits where possible:
  - `feat: add /guild-info slash command`
  - `fix: correct role mapping for contributor role`
  - `docs: update bot setup guide`
  - `chore: upgrade discord.js to latest`
- Keep commits focused — one logical change per commit.

---

## Submitting a Pull Request

1. Push your branch to your fork.
2. Open a PR against `Adamantine-Guild/guildpass-app` on the `main` branch.
3. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely, including:
   - The linked issue number
   - A summary of changes
   - Test evidence (logs, screenshots of bot responses, or docs previews)
4. Run the following before submitting:

```bash
npm run typecheck   # Must pass with no errors
npm run lint        # Fix any reported issues
```

### PR Quality expectations

- The bot must still start and respond to commands after your change.
- Any new slash command must include a help description and error handling.
- Docs changes must render correctly in Docusaurus (`npm run dev:docs`).
- TypeScript types must be correct — no `any` without justification.

---

## Review Process

- A maintainer will review your PR within **5 business days**.
- Address all requested changes promptly.
- Once approved, a maintainer will merge the PR.
- Large or breaking changes may require additional review.

---

## Communication

- GitHub Issues: preferred for bug reports, feature requests, and task discussion
- Contact: maintainers@guildpass.xyz
- [GrantFox maintainer app](https://maintainer.grantfox.xyz) for campaign and reward coordination
