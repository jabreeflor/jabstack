# jabstack

A portable [Agent Plugin](https://agent-plugins.org/) — a stack of reusable Agent Skills
that works in Claude Code and any other client that speaks the Agent Plugins spec.

## Skills

| Skill | What it does |
|---|---|
| [`gauntlet-loop`](skills/gauntlet-loop/SKILL.md) | Turns a short topic into a reference-grade build: benchmarked against a real shipped product, subagent fan-out across every quality domain, a per-domain loop with an independent harsh critic, and blind A/B judging until every critic picks our version. |

Invoke it as `/gauntlet-loop <topic>`, or just ask to "gauntlet" something.

## Layout

```
jabstack/
├── plugin.json      # manifest (Agent Plugins 1.0.0)
├── skills/          # portable core — one directory per skill
│   └── gauntlet-loop/
│       └── SKILL.md
└── agents/          # Claude Code only (see note below)
    └── gauntlet-critic.md
```

### A note on `agents/`

Agent Plugins v1 defines only **skills** and **MCP servers** as portable components —
commands, hooks, and agents are [explicitly out of scope](https://agent-plugins.org/specification)
as "too client-specific for a stable portable contract."

`gauntlet-critic` is the adversarial reviewer `gauntlet-loop` leans on. It ships here in
Claude Code's native `agents/` location. Clients that don't read `agents/` will ignore it,
and the skill still works — it just falls back to a generic critic subagent instead of the
tuned one.

## Adding a skill

Create `skills/<skill-name>/SKILL.md` with YAML frontmatter:

```markdown
---
name: my-skill
description: What it does and when the agent should reach for it.
---

Instructions the agent follows when this skill loads.
```

`name` must match the directory name. The `description` is what an agent matches against to
decide relevance — write it as "do X when Y", not as a title.

Only `name`, `description`, `license`, `compatibility`, `metadata`, and `allowed-tools` are
allowed in frontmatter. **Anything else is a fatal validation error** and the skill gets
skipped silently. Client-specific fields like `argument-hint` belong under `metadata`.

Validate before committing:

```bash
npx skills-ref validate ./skills/my-skill
```

## Install

```bash
git clone https://github.com/jabreeflor/jabstack.git
```

Then point your agent client at the directory.

## License

MIT — see [LICENSE](LICENSE).
