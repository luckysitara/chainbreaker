---
summary: "CLI reference for `chainbreaker logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `chainbreaker logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
chainbreaker logs
chainbreaker logs --follow
chainbreaker logs --json
chainbreaker logs --limit 500
chainbreaker logs --local-time
chainbreaker logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
