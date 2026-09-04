<p align="center">
  <img src="assets/banner.svg" alt="jabstack — a portable stack of agent skills" width="820">
</p>

<p align="center">
  A portable <a href="https://agent-plugins.org/">Agent Plugin</a> — reusable Agent Skills that work in
  Claude Code and any other client that speaks the Agent Plugins spec.
</p>

---

## Install

The fastest way is [skills.sh](https://www.skills.sh). No clone, no config:

```bash
npx skills add jabreeflor/jabstack
```

You get an interactive picker — choose the skills you want, then the agents to install them
into. It auto-detects the agents already set up on your machine.

**What that looks like when it's done.** The skill is copied into your agent's own skills
directory, right inside the project:

```
your-project/
└── .claude/
    └── skills/
        └── gauntlet-loop/
            └── SKILL.md
```

That's the whole install. Restart your agent and `/gauntlet-loop` is there.

### Other ways to run it

```bash
# See what's in here without installing anything
npx skills add jabreeflor/jabstack --list

# Grab one skill, skip the prompts
npx skills add jabreeflor/jabstack --skill gauntlet-loop -y

# Target a specific agent
npx skills add jabreeflor/jabstack -a claude-code

# Install globally (~/.claude/skills) instead of into this project
npx skills add jabreeflor/jabstack -g
```

And once it's installed:

```bash
npx skills list                 # what you have
npx skills update               # pull the latest versions
npx skills remove gauntlet-loop # uninstall
```

### Or clone the whole plugin

`npx skills` installs **skills only**. To also get the `gauntlet-critic` subagent, take the
whole repo and point your agent client at the directory:

```bash
git clone https://github.com/jabreeflor/jabstack.git
```

## Skills

| Skill | What it does |
|---|---|
| [`gauntlet-loop`](skills/gauntlet-loop/SKILL.md) | Turns a short topic into a reference-grade build: benchmarked against a real shipped product, subagent fan-out across every quality domain, a per-domain loop with an independent harsh critic, and blind A/B judging until every critic picks our version. |
| [`create-pr-artifact`](skills/create-pr-artifact/SKILL.md) | Builds a visual explainer artifact for a PR (how the change works, what to look at, how to verify), screenshots it, and attaches both the screenshots and the artifact link to the PR summary with `gh pr edit --attach`. |

Run them as `/gauntlet-loop <topic>` or `/create-pr-artifact [PR]`, or just ask to "gauntlet"
something / "add an artifact to the PR".

## Layout

```
jabstack/
├── plugin.json    # manifest (Agent Plugins 1.0.0)
├── skills/        # the portable core — one directory per skill
│   ├── gauntlet-loop/SKILL.md
│   └── create-pr-artifact/SKILL.md
└── agents/        # Claude Code only
    └── gauntlet-critic.md
```

Agent Plugins v1 defines only **skills** and **MCP servers** as portable —
commands, hooks, and agents are [out of scope](https://agent-plugins.org/specification).
So `gauntlet-critic` ships in Claude Code's native `agents/` location. Clients that don't
read `agents/` just ignore it, and `gauntlet-loop` still works — it falls back to a generic
critic subagent instead of the tuned one.

## Adding a skill

Create `skills/<skill-name>/SKILL.md`:

```markdown
---
name: my-skill
description: What it does and when the agent should reach for it.
---

Instructions the agent follows when this skill loads.
```

Three rules:

1. `name` must match the directory name.
2. `description` is what an agent matches against — write it as "do X when Y", not as a title.
3. Only `name`, `description`, `license`, `compatibility`, `metadata`, and `allowed-tools`
   are allowed in frontmatter. Anything else is a fatal validation error and the skill gets
   skipped **silently**. Client-specific fields like `argument-hint` go under `metadata`.

Validate before committing:

```bash
npx skills-ref validate ./skills/my-skill
```

## License

MIT — see [LICENSE](LICENSE).
