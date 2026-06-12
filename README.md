# GuildPass Integrations Monorepo <!-- IC: 122 -->

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE) <!-- IC: 123 -->
[![Node](https://img.shields.io/badge/node-%3E%3D18.17-green?style=flat-square)](https://nodejs.org) <!-- IC: 124 -->
[![GrantFox](https://img.shields.io/badge/GrantFox-open%20for%20contributions-orange?style=flat-square)](https://contribute.grantfox.xyz) <!-- IC: 125 -->

Monorepo for GuildPass ecosystem integrations. It contains an MVP Discord bot and a Docusaurus docs site that treat **guildpass-core** as the source of truth for membership and roles. <!-- IC: 126 -->

> **Part of the [Adamantine-Guild](https://github.com/Adamantine-Guild) project** — a Web3 membership and token-gated community platform built for the open-source ecosystem. <!-- IC: 127 -->

## Structure <!-- IC: 128 -->

- apps/discord-bot — MVP Discord bot <!-- IC: 129 -->
- apps/docs — Docusaurus documentation site <!-- IC: 130 -->
- packages/integration-client — typed client for guildpass-core <!-- IC: 131 -->
- packages/webhook-utils — lightweight webhook verification stubs <!-- IC: 132 -->

## Prerequisites <!-- IC: 133 -->

- Node 18+ <!-- IC: 134 -->
- A Discord application with a bot token and the applications.commands scope <!-- IC: 135 -->

## Install <!-- IC: 136 -->

```bash
npm install
```

## Environment <!-- IC: 137 -->

Create a `.env` in the repository root or `apps/discord-bot` with: <!-- IC: 138 -->

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
GUILD_PASS_CORE_URL=
GUILD_PASS_CORE_API_KEY=
DISCORD_ROLE_ADMIN=
DISCORD_ROLE_MEMBER=
DISCORD_ROLE_CONTRIBUTOR=
```

## Register Commands <!-- IC: 139 -->

```bash
npm run register:commands
```

## Run the Bot <!-- IC: 140 -->

```bash
npm run dev:bot
```

Commands: <!-- IC: 141 -->

- /verify wallet — simple wallet verification placeholder that calls core <!-- IC: 142 -->
- /status — show current membership and roles from core <!-- IC: 143 -->
- /refresh-roles — reconcile roles in Discord to the state from core <!-- IC: 144 -->

## Run the Docs <!-- IC: 145 -->

```bash
npm run dev:docs
```

## Design Notes <!-- IC: 146 -->

- Policy and eligibility logic live in guildpass-core <!-- IC: 147 -->
- The bot reads membership and roles from core and updates Discord <!-- IC: 148 -->
- Only a small role set is supported: admin, member, contributor <!-- IC: 149 -->
- Logs are concise and audit-friendly in the server console <!-- IC: 150 -->

## Linting & Type-checking <!-- IC: 151 -->

```bash
npm run typecheck   # TypeScript check across all workspaces
npm run lint        # Lint (no linter configured for MVP — extend as needed)
```

## Deferred Areas

- Advanced moderation, appeals, and case management
- Rich notifications and escalation workflows
- Complex role sync rules or schedule-based sync
- Multi-platform chat and event integrations
- DAO governance tooling and on-chain orchestration
- A robust webhook ecosystem with retries and signatures

Interfaces and stubs are included to show boundaries and extension points.

---

## 🦊 Contributing via GrantFox

This repository is open for contributions through **[GrantFox](https://contribute.grantfox.xyz)** — the open-source collaboration hub for the Web3 ecosystem.

### How to contribute

1. Browse open issues tagged [`good first issue`](https://github.com/Adamantine-Guild/guildpass-app/issues?q=label%3A%22good+first+issue%22) or [`help wanted`](https://github.com/Adamantine-Guild/guildpass-app/issues?q=label%3A%22help+wanted%22).
2. Apply for an issue on [GrantFox](https://contribute.grantfox.xyz) or comment directly on GitHub.
3. Fork the repo, create a feature branch, implement your change, open a PR.
4. Follow the checklist in the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
5. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contribution guide.

### Maintainer resources

- [Maintainer app](https://maintainer.grantfox.xyz)
- [GrantFox docs](https://docs.grantfox.xyz)
- Contact: maintainers@guildpass.xyz

## 📄 License

MIT — see [LICENSE](./LICENSE).
