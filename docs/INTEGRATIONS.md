# Integrations

SignalFlow is local-first. It generates assets and drafts that users can review before publishing through official channels.

Inputs can be pasted notes, changelogs, code snippets, screenshot text, launch context, or a local repository path.

SignalFlow treats repositories, files, screenshots, changelogs, and notes as **assets**. Channels are output formats selected by the user.

## Model Generation

Today:

- Generate local template drafts.
- Export a prompt that can be pasted into a local SLM, API model, or free chatbot.
- Keep generated JSON and Markdown in `pipeline-output/` for review.
- Run `python -m signalflow.cli launch-kit --notes-file <file> --channel linkedin --channel newsletter`.

Recommended next integration:

1. Add provider adapters for OpenAI-compatible APIs, local SLM servers, and clipboard-only chatbot flows.
2. Require users to choose channels before generation.
3. Store API keys only in local environment variables or OS keychain.
4. Never publish automatically without explicit approval.

Example manual release flow:

```bash
python -m signalflow.cli launch-kit --notes-file launch-notes.md --channel linkedin --channel x
```

## LinkedIn and X

Today:

- Generate editable post drafts for LinkedIn and X.
- Keep publishing manual so users can adjust tone and comply with platform rules.

Recommended next integration:

1. Add OAuth-based account connection.
2. Store tokens only in an OS keychain or encrypted local store.
3. Support draft creation before publishing.
4. Add per-platform preview and character validation.

## Blogs and Docs

Today:

- Generate a blog intro and slide outline.
- Export Markdown that can be pasted into docs, newsletters, or static-site posts.

Recommended next integration:

1. Add templates for MDX, Docusaurus, Astro, and Next.js content folders.
2. Let users choose an output path inside their repo.
3. Create a draft file rather than committing automatically.

## Security Rules

- Do not scrape browser sessions.
- Do not bypass platform rate limits or authentication.
- Do not auto-publish without review.
- Do not upload private source code unless the user explicitly configures a trusted model provider.
