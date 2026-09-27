# gh-refs

A [Claude Code mod](https://github.com/anthropics/claude-code/tree/main/mods) that pulls a
GitHub issue or PR into the conversation without leaving the prompt.

- Type `#github` in the prompt. Your draft is set aside and a picker opens with the
  repo's issues and PRs, the filter already focused.
- Type to filter by title or number. **Tab** or **↑/↓** moves, **Enter** picks,
  **Esc** cancels and puts your draft back.
- The pick is sent as the prompt: whatever you typed before `#github`, then the item's
  title, state, author, link, description and comments.
- `/github [filter]` opens the same picker.

Needs the [GitHub CLI](https://cli.github.com) (`gh`) signed in, and a working directory
inside a GitHub repository. The list refreshes every two minutes.

## Narrow terminals

Claude Code only draws a pane a plugin opens on its own when the terminal is at least
144 columns wide. Below that, `#github` puts your draft back and points you at
`/github`, which opens at any width because you asked for it.

## Enable

Mods are early access. Hooks modules load only with function hooks on, and the API may
change between Claude Code releases:

```bash
export CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1
```

Then install it from the jabstack marketplace:

```
/plugin marketplace add jabreeflor/jabstack
/plugin install gh-refs@jabstack
```

Or run it from a clone:

```bash
claude --plugin-dir /path/to/jabstack/mods/gh-refs
```

## Layout

```
gh-refs/
├── .claude-plugin/plugin.json
└── hooks/
    ├── hooks.json    # names the hooks module
    └── register.ts   # the picker: #github trigger, /github, the pane, the pick
```
