# jabstack

A portable [Agent Plugin](https://agent-plugins.org/) — a stack of reusable Agent Skills
that works in Claude Code and any other client that speaks the Agent Plugins spec.

## Status

Scaffold. No skills yet.

## Layout

```
jabstack/
├── plugin.json      # manifest (Agent Plugins 1.0.0)
├── skills/          # one directory per skill
│   └── <skill-name>/
│       ├── SKILL.md
│       ├── scripts/      (optional)
│       └── references/   (optional)
└── mcp.json         # optional — MCP server declarations
```

## Adding a skill

Create `skills/<skill-name>/SKILL.md` with YAML frontmatter:

```markdown
---
name: my-skill
description: What it does and when the agent should reach for it.
---

Instructions the agent follows when this skill loads.
```

The `description` is what an agent matches against to decide relevance — write it as
"do X when Y", not as a title.

## Install

Clone it and point your agent client at the directory:

```bash
git clone https://github.com/jabreeflor/jabstack.git
```

## License

MIT — see [LICENSE](LICENSE).
