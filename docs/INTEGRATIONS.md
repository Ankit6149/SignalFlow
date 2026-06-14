# Integrations

SignalFlow is local-first. It generates assets and drafts that users can review before publishing through official channels.

## GitHub

Today:

- Generate a GitHub release draft in the launch kit.
- Generate a Markdown export that can be copied into a release, issue, PR, or discussion.
- Keep generated JSON and Markdown in `pipeline-output/` for review.
- Run `python -m signalflow.cli launch-kit --repo <repo>` in local scripts or release prep checklists.

Recommended next integration:

1. Add a GitHub CLI helper that creates a draft release from `launch-kit.md`.
2. Require the user to confirm the repository, tag, title, and release body.
3. Use `gh release create --draft` or the official GitHub API.
4. Never publish automatically without explicit approval.

Example manual release flow:

```bash
python -m signalflow.cli launch-kit --repo . --project-name "SignalFlow"
gh release create v0.1.0 --draft --notes-file pipeline-output/<kit-folder>/launch-kit.md
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
