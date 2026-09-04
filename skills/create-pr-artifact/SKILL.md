---
name: create-pr-artifact
description: Build an explainer artifact for a pull request (how the change works, with diagrams and screenshots), publish it, and attach it to the PR with the GitHub CLI so the PR summary carries both the screenshots and the artifact link. Use when the user types /create-pr-artifact [PR number or branch], or asks to "add an artifact to the PR", "explain this PR visually", or "attach screenshots to the PR".
license: MIT
compatibility: Designed for Claude Code with the Artifact tool and the `gh` CLI (authenticated, with push access to the repo).
metadata:
  argument-hint: "[PR number | branch] — defaults to the PR for the current branch"
  author: jabreeflor
  version: "1.0"
---
# Create PR Artifact

Target: `$ARGUMENTS` (empty = the PR for the current branch).

Produce one artifact that explains **how the change works**, then put its screenshots and
link into the PR body. Do it in this order; don't skip the screenshot step.

## 1. Resolve the PR

```bash
gh pr view $ARGUMENTS --json number,title,body,headRefName,baseRefName,url,files
gh pr diff $ARGUMENTS
```

Read the diff and the touched files. You are explaining the mechanism, not the diff — what
the reader needs to know to understand or review the change.

## 2. Build the artifact

Load the `artifact-design` skill (and `artifact-diagramming` if a diagram earns its place).
Write a single HTML page to the scratchpad with:

- **Title** = the PR title. One-line summary at the top: what changed and why.
- **How it works**: the flow before vs after, one diagram if there's a sequence or data
  path, key decisions and trade-offs. Short. A reviewer should get it in two minutes.
- **What to look at**: the 2–5 files that matter, each with one sentence.
- **How to verify**: exact commands or clicks.

Publish it with the Artifact tool. Keep the artifact URL.

## 3. Screenshot it

Render the published page with Playwright (Chromium is preinstalled) and capture one
full-page shot plus one per major section:

```bash
node -e '
const {chromium}=require("playwright");(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:800}});
await p.goto(process.argv[1],{waitUntil:"networkidle"});
await p.screenshot({path:"artifact-full.png",fullPage:true});await b.close();})()' "$ARTIFACT_URL"
```

Screenshots must live somewhere GitHub can render. Commit them to the PR branch under
`.github/pr-artifacts/<pr-number>/` and push:

```bash
git add .github/pr-artifacts/<n>/ && git commit -m "docs: add PR artifact screenshots" && git push
```

Reference each as
`https://raw.githubusercontent.com/<owner>/<repo>/<headRefName>/.github/pr-artifacts/<n>/<file>.png`.

## 4. Attach to the PR

Rewrite the PR body so the summary section carries the artifact. Preserve everything already
there; append (or replace a previous `## Artifact` section) with:

```markdown
## Artifact

📎 **[How this works — interactive explainer](<artifact-url>)**

![Overview](<raw-png-url>)

<details><summary>More screenshots</summary>

![Section](<raw-png-url>) …

</details>
```

Apply it with the CLI, never by hand-pasting into the browser:

```bash
gh pr edit <n> --body-file body.md
```

Then confirm the image renders: `gh pr view <n> --json body -q .body | grep -c raw.githubusercontent`.

## Report

Three lines: the artifact link, the PR link, and how many screenshots were attached.
