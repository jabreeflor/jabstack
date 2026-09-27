import type { EngineInterface, On } from 'claude-code'

type Engine = EngineInterface

type Ref = {
  number: number
  kind: 'PR' | 'Issue'
  title: string
  state: string
  url: string
}

type Picker = {
  refs: Ref[]
  filter: string
  draft: string
  isPicking: boolean
}

type GhRow = { number: number; title: string; state: string; url: string }

type GhDetails = {
  author?: { login: string }
  body: string
  comments: { author?: { login: string }; body: string }[]
}

const PANE_ID = 'gh-refs'
const REFRESH_MS = 2 * 60 * 1000
const MAX_ROWS = 8

/** `#github` just typed, at the start of the draft or after a space. */
const TRIGGER = /(?:^|\s)#github$/

/**
 * A `#github` picker for the repo's issues and PRs.
 *
 * Typing `#github` sets the draft aside and opens a focused picker: type to
 * filter, Tab or the arrows to move, Enter to pick. The pick is sent as the
 * prompt, the draft before `#github` first, then the item's title, state,
 * body and comments. Escape closes it and puts the draft back.
 *
 * @param on the engine's registrar
 */
export function register(on: On) {
  const state: Picker = { refs: [], filter: '', draft: '', isPicking: false }

  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const cwd = await $.session.cwd()

    const list = async (noun: 'issue' | 'pr'): Promise<GhRow[]> => {
      const { exitCode, stdout } = await $.process.run(
        ['gh', noun, 'list', '--state', 'all', '--limit', '100', '--json', 'number,title,state,url'],
        { cwd },
      )

      return exitCode === 0 ? (JSON.parse(stdout) as GhRow[]) : []
    }

    const refresh = async () => {
      const [issues, prs] = await Promise.all([list('issue'), list('pr')])

      state.refs = [
        ...prs.map(r => ({ ...r, kind: 'PR' as const })),
        ...issues.map(r => ({ ...r, kind: 'Issue' as const })),
      ]
        .map(r => ({ ...r, state: r.state.toLowerCase() }))
        .sort((a, b) => b.number - a.number)
    }

    await $.command.register({
      name: 'github',
      description: 'Pick a GitHub issue or PR and send its details as the prompt',
      argumentHint: '[filter]',
    })
    await refresh().catch(() => undefined)
    $.clock.every(REFRESH_MS, () => void refresh().catch(() => undefined))

    return result
  })

  on('prompt.edit', async ($, e, next) => {
    const box = await next(e)
    const typed = TRIGGER.exec(box.text.slice(0, box.cursor))

    if (!typed || state.refs.length === 0 || state.isPicking) {
      return box
    }

    state.draft = (box.text.slice(0, typed.index) + box.text.slice(box.cursor)).trim()
    state.filter = ''
    state.isPicking = true

    void openPicker($, state, true)

    return { text: '', cursor: 0 }
  })

  on('command.run', { command: 'github' }, async ($, e) => {
    state.draft = ''
    state.filter = e.args.trim()
    state.isPicking = true

    await openPicker($, state, false)

    return {}
  })

  on('ui.close', { id: PANE_ID }, async ($, e, next) => {
    const result = await next(e)

    if (state.isPicking) {
      state.isPicking = false

      if (state.draft) {
        await $.prompt.fill({ text: state.draft })
      }
    }

    return result
  })

  on('ui.render', { component: 'Pane' }, async ($, e, next) => {
    if (e.requestId !== PANE_ID) {
      return next(e)
    }

    const { Box, Text, Input, Button } = await $.ui.resolve(e)
    const shown = matchesOf(state.refs, state.filter).slice(0, MAX_ROWS)

    const rows = shown.map(r =>
      Button({
        key: `ref-${r.number}`,
        plain: true,
        label: `#${r.number}  ${r.kind.padEnd(5)} ${r.state.padEnd(6)}  ${r.title}`,
        onPress: () => void pick($, state, r),
      }),
    )

    return Box({
      flexDirection: 'column',
      children: [
        Input({
          key: 'filter',
          label: '#github ',
          placeholder: 'filter by title or number',
          value: state.filter,
          submitLabel: 'pull top match',
          autoFocus: true,
          onInput: value => {
            state.filter = value
            $.ui.invalidate('ui.render')
          },
          onSubmit: value => void pick($, state, matchesOf(state.refs, value)[0]),
        }),
        ...(rows.length
          ? rows
          : [Text({ dimColor: true, children: `nothing matches "${state.filter}"` })]),
        Text({
          dimColor: true,
          children: 'Tab/↑↓ move · Enter picks · Esc cancels',
        }),
      ],
    })
  })
}

/**
 * The refs a filter keeps: by number prefix when it is digits, else by title.
 */
function matchesOf(refs: Ref[], q: string): Ref[] {
  const needle = q.trim().toLowerCase()

  if (needle === '') {
    return refs
  }

  return /^\d+$/.test(needle)
    ? refs.filter(r => String(r.number).startsWith(needle))
    : refs.filter(r => r.title.toLowerCase().includes(needle))
}

/**
 * Opens the picker with the keyboard. One opened from typing is the plugin's
 * own, so a narrow terminal keeps it undrawn: then the draft goes back and a
 * toast points at `/github`, which the person asks for and draws at any width.
 */
async function openPicker($: Engine, state: Picker, isFromTyping: boolean) {
  await $.ui.open({
    id: PANE_ID,
    title: 'GitHub',
    focus: true,
    closeOnEscape: true,
    rows: MAX_ROWS + 3,
  })

  if (!isFromTyping) {
    return
  }

  const panes = await $.ui.panes()
  const pane = panes.find(p => p.id === PANE_ID)

  if (pane && !pane.isPlaced) {
    state.isPicking = false
    await $.ui.close({ id: PANE_ID })
    await $.prompt.fill({ text: state.draft ? `${state.draft} ` : '' })
    $.ui.toast('Terminal too narrow for the #github picker. Use /github instead.', {
      timeoutMs: 6000,
    })
  }
}

/**
 * Closes the picker and sends the pick as the prompt, after the saved draft.
 */
async function pick($: Engine, state: Picker, ref: Ref | undefined) {
  if (!ref || !state.isPicking) {
    return
  }

  state.isPicking = false
  await $.ui.close({ id: PANE_ID })

  const details = await detailsOf($, ref)

  await $.prompt.submit({
    text: state.draft ? `${state.draft}\n\n${details}` : details,
  })
}

/**
 * The item as a prompt: its title, state, author, link, body and comments.
 */
async function detailsOf($: Engine, ref: Ref): Promise<string> {
  const noun = ref.kind === 'PR' ? 'pr' : 'issue'
  const { exitCode, stdout } = await $.process.run(
    ['gh', noun, 'view', String(ref.number), '--json', 'number,title,state,url,author,body,comments'],
    { cwd: await $.session.cwd() },
  )

  const head = `GitHub ${ref.kind} #${ref.number}: ${ref.title} (${ref.state})\n${ref.url}`

  if (exitCode !== 0) {
    return head
  }

  const item = JSON.parse(stdout) as GhDetails
  const comments = item.comments
    .map(c => `- @${c.author?.login ?? 'unknown'}: ${c.body.trim()}`)
    .join('\n')

  return [
    `${head}\nAuthor: @${item.author?.login ?? 'unknown'}`,
    item.body.trim() || '(no description)',
    comments ? `Comments:\n${comments}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
