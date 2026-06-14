# Roadmap

SignalFlow should become a focused, useful open-source product rather than a bundle of demos.

## Product Bet

Build for builders, developers, founders, and maintainers who want to share technical progress publicly without starting from a blank page or sending private work to a cloud tool.

The one-line promise:

> Turn technical work into polished launch assets: posts, signal cards, changelog summaries, newsletters, and slide outlines.

## MVP Workflow

1. Paste notes, changelog text, code, or choose a local repository.
2. SignalFlow extracts the strongest signal.
3. The user reviews one or more highlights.
4. SignalFlow creates:
   - social post variants,
   - newsletter and blog drafts,
   - a code image,
   - a short technical summary,
   - a slide outline,
   - a local export folder.
5. Nothing publishes automatically.

## Priorities

### 1. Make the First Run Excellent

- Replace placeholder repo paths with a guided empty state.
- Show one primary action: "Create launch kit".
- Add clear backend status and setup help when the API is offline.
- Save outputs into one timestamped folder.
- Include a sample repo/demo mode so visitors can try the product in one minute.
- Add copy/export actions for every generated draft.

### 2. Make the Core Engine Trustworthy

- Improve file ranking with git diff awareness.
- Ignore generated, lock, minified, vendored, and binary-heavy files.
- Add tests for repo scanning, pipeline output shape, and API routes.
- Avoid arbitrary shell command execution in default demos.
- Make terminal recording opt-in and clearly labeled.

### 3. Make Outputs Worth Sharing

- Add platform presets: X, LinkedIn, blog intro, release notes.
- Add tone controls: technical, founder, DevRel, concise.
- Add editable templates before export.
- Improve code image themes and dimensions.
- Generate a Markdown launch kit alongside JSON.
- Add a GitHub draft release helper using official GitHub APIs.

### 4. Make It Contributor Friendly

- Add screenshots or a short demo GIF to the README.
- Add issue templates for bugs, feature requests, and good first issues.
- Add CI for Python tests and frontend build.
- Document architecture in `docs/architecture.md`.
- Publish a small set of labeled starter issues.
- Keep the CLI stable so integrations can build on it without depending on the UI.

## What Not To Build Yet

- Auto-posting to social platforms.
- Complex cloud accounts.
- Browser/session scraping.
- A large multi-language native stack before the Python/Next.js path feels great.

## Good First Issues

- Add a `--since` option that uses `git diff` to rank recently changed files.
- Add a Markdown export next to `pipeline_summary.json`.
- Add LinkedIn/X post templates to the local stub.
- Add frontend error states for offline backend responses.
- Add a sample project fixture for demos and tests.
- Add OAuth-backed draft publishing adapters behind explicit user approval.
