# SignalFlow Frontend

Next.js App Router frontend for the local SignalFlow backend.

```bash
npm install
npm run dev
```

The UI proxies API calls to `BACKEND_URL`, defaulting to `http://localhost:8000`.

Start the backend from the repository root first:

```bash
python -m signalflow.cli serve --host 127.0.0.1 --port 8000
```

Build check:

```bash
npm run build
```

Primary workflow:

1. Start the backend.
2. Paste a local repository path.
3. Click `Create launch kit`.
4. Review the generated channel drafts, code visual, slide outline, and export paths.
