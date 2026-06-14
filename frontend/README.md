# SignalFlow Studio Frontend

Next.js App Router app for SignalFlow Studio. The frontend contains the UI,
generation routes, media capture workflow, crawler files, and posting-package
formatter in one deployable app.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional private hosted demo lock:

```text
SIGNALFLOW_ACCESS_KEY=make-a-long-private-key-here
```

If `SIGNALFLOW_ACCESS_KEY` is set, generation API routes require owner access.
The UI exchanges the owner key for a signed 30-day browser session token, so the
owner does not need to re-enter it every visit. Leave it empty for local use or
for open self-hosted installs.

Do not use a `NEXT_PUBLIC_` name for this value. It is read only by server-side
API routes, and the browser receives only the signed session token.

Vercel project settings when this folder is selected as Root Directory:

```text
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

Build check:

```bash
npm run build
```

Primary workflow:

1. Describe what should be posted.
2. Add optional source data, links, or captured media.
3. Select channels.
4. Generate the posting package.
5. Review the channel drafts, generated card, prompt, media plan, and export config.
