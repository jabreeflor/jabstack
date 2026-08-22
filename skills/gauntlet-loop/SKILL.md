---
name: gauntlet-loop
description: Turn a short topic into a full "gauntlet" build — benchmarked against a real shipped product, subagent fan-out over every quality domain, a per-domain loop with an independent harsh critic, and blind side-by-side judging until every critic picks our version. Use when the user types /gauntlet-loop <topic>, or asks to "gauntlet" / "run the gauntlet on" something.
license: MIT
compatibility: Designed for Claude Code (or a client that supports subagent fan-out and web access).
metadata:
  argument-hint: <topic to build at reference-grade quality>
  author: jabreeflor
  version: "1.0"
---
# Gauntlet Loop

Topic: `$ARGUMENTS`

Expand the topic into this prompt, then execute it:

> Build `<artifact>` at the level of `<the most recent version of a real shipped product>`.
> It should be utterly perfect, with every single thing done at the highest quality — from
> textures to physics to anything you could think of.
>
> Fan out subagents and have each tackle one domain individually. Loop on each domain and
> have a **separate** subagent check it and confirm it hits that bar. That separate subagent
> is a really harsh critic — if it doesn't hit the bar, keep going.
>
> Don't stop until each critic is utterly wowed compared to the real thing. It should
> literally compare them side by side **blind** and say which one is better. Loop until
> it's utterly perfect.

If `$ARGUMENTS` is empty, ask what to gauntlet. Otherwise the invocation is the permission —
start. Ask at most one clarifying question, only if the benchmark is genuinely ambiguous.

## Report

Short. Which one the blind critics picked, the final score, the per-domain scoreboard, the
tells that remain, a link to the artifact. Don't recount the rounds.
