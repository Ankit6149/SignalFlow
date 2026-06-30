# Product Grade Open Source Direction

SignalFlow Studio should be built as a serious product, even while it remains open source and local first.

The current goal is not a weak demo. The current goal is:

```text
product quality local app
open source distribution
clean modular architecture
no forced cloud account
no expensive server dependency
```

## Product Positioning

SignalFlow Studio is an open source local first AI content studio for builders.

It turns product work into publish ready content:

```text
product notes
screen recordings
screenshots
repo context
changelogs
website links
launch ideas
```

into:

```text
LinkedIn posts
X posts and threads
Instagram captions
carousel outlines
short video scripts
blog or newsletter drafts
release notes
```

## What The Product Must Feel Like

Even as open source, it should feel like a real product:

- clean onboarding
- clear dashboard
- project profiles
- fast create flow
- local screen recording
- good previews
- editable outputs
- local content library
- export and copy actions
- clear settings
- strong security messaging
- no dead core buttons

## What Stays Local First

For the open source version:

- recordings stay on the user's device by default
- projects and packages can be stored locally
- API keys can be session only
- local model routes should stay supported
- demo/template mode should work without an API key
- social posting should remain review first
- mock posting must be labeled clearly

## Product Architecture

The app should be designed with clean boundaries:

- storage service abstraction
- provider service abstraction
- posting service abstraction
- audit event abstraction
- feature flag constants
- hosted mode guards
- security docs
- clean extension boundary
- database schema notes for self-hosting experiments

Do not hardcode the app into a throwaway local demo. Keep the code modular, understandable, and easy to extend.

## What Not To Build Now

Do not block the local product on:

- mandatory login
- mandatory database
- cloud video storage
- hosted AI credits
- team permissions
- complicated enterprise settings

These are optional layers, not required for the first strong product.

## Engineering Rule

Every feature should answer one question:

```text
Does this help one builder create better content from real product work faster?
```

If yes, build it well.
If no, keep it out for now.

## Launch Readiness For Open Source

Before public open source launch, the app should have:

- working local install
- working build
- useful README
- screenshots or demo GIF later
- clear security notes
- clear local first explanation
- clear contribution direction
- clean issue templates later
- no misleading product claims

## Self Hosting Readiness

For advanced self hosting, keep the app ready for optional infrastructure:

- user authentication
- database backed workspaces
- encrypted server side secret storage
- server side audit logs
- usage limits
- official social OAuth flows

Those are optional deployment layers and should not slow down the local first product.
