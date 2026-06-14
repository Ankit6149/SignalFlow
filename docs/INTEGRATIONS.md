# SignalFlow Studio Integrations

SignalFlow Studio is local-first. It generates formatted posting packages that users can review before publishing through official channels.

Inputs can be a simple description, pasted notes, changelogs, code snippets, screenshot text, launch context, metrics, research, screen recordings, screenshots, links, or a local repository path.

SignalFlow Studio treats repositories, files, screenshots, screen recordings, changelogs, research excerpts, URLs/PDF notes, and raw descriptions as **input assets**. Selected social accounts or channels determine the output format.

## Model Generation

Today:

- Generate local template drafts.
- Export a prompt that can be pasted into a local SLM, API model, or free chatbot.
- Run the main hosted product as standalone Next.js API routes.
- Return `context_engine` metadata with source types and input count.
- Return `model_adapter` metadata with selected generator route and readiness status.
- Keep generated JSON and Markdown in `pipeline-output/` for review.
- Generate visual media plans for screenshots, screen recordings, GIF/video loops, generated cards, and platform variants.

Recommended next integration:

1. Add provider adapters inside the Next.js app for OpenAI-compatible APIs, local SLM servers, and clipboard-only chatbot flows.
2. Let users connect/select a model route once, then use autopilot defaults.
3. Store API keys only in local environment variables or OS keychain.
4. Never publish automatically without explicit approval.
5. Use official APIs, webhooks, exports, or manual copy. Do not depend on private platform APIs or stealth transport.

The hosted app owns the full flow: input, model routing, media planning, platform formatting, review, and handoff.

## Selected Social Accounts

Today:

- Generate editable post drafts for LinkedIn, X, Instagram, blog, newsletter, and release notes.
- Generate a media plan that explains what screenshots, recordings, GIFs, cards, or clips should be used for each package.
- Keep publishing manual so users can adjust tone and comply with platform rules.

Recommended next integration:

1. Add OAuth-based account connection.
2. Store tokens only in an OS keychain or encrypted local store.
3. Support draft creation before publishing.
4. Add per-platform preview, character validation, and media aspect-ratio validation.

## Blogs and Docs

Today:

- Generate a blog intro, newsletter draft, release note, and reusable Markdown package.
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
