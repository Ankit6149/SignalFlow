# Product Grade Open Source Direction

SignalFlow Studio should be built as a serious product, even while it remains open source and local first.

The current goal is not a weak demo. The current goal is:

```text
product quality local app now
open source distribution now
clean upgrade path to SaaS later
no forced cloud account today
no expensive server dependency today
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

## What Is Product Grade But Not SaaS Yet

The app should still be designed with upgrade paths:

- storage service abstraction
- provider service abstraction
- posting service abstraction
- audit event abstraction
- plan and feature flag constants
- hosted mode guards
- security docs
- clean extension boundary
- clear database schema docs for the future

Do not hardcode the app into a throwaway local demo. Keep the code modular enough that database, auth, billing, and encrypted secret storage can be added later.

## Monetization Path Later

Future monetization can be added as optional layers:

### Open source free

- local app
- demo/template mode
- BYOK AI
- local models
- local library
- manual export

### Paid hosted or pro version later

- hosted sync
- encrypted saved provider keys
- connected channels
- scheduling worker
- team workspace
- cloud package library
- hosted AI credits
- priority templates
- advanced analytics

## What Not To Build Now

Do not block the local product on:

- billing
- mandatory login
- mandatory database
- cloud video storage
- hosted AI credits
- team permissions
- complicated enterprise settings

These are future layers, not required for the first strong product.

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
- no misleading SaaS claims

## Future SaaS Readiness

If SignalFlow becomes a paid hosted product later, it must add:

- real user authentication
- database backed workspaces
- encrypted server side secret storage
- server side audit logs
- usage limits
- billing
- abuse prevention
- official social OAuth flows

Those are documented separately and should be implemented when there is money or real demand.
