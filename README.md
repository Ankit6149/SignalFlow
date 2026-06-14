# SignalFlow (safe subset)

This repository contains a safe, local-first implementation of the "Context Ingestion & Code Explorer" module described in the architecture doc. It purposefully omits any functionality that would bypass platform security or harvest session secrets.

Quick start:

```bash
python -m signalflow.cli --repo <path-to-repo> --top 10
```
