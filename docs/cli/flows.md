---
summary: "CLI reference for `chainbreaker flows` (list, inspect, cancel)"
read_when:
  - You want to inspect or cancel a flow
  - You want to see how background tasks roll up into a higher-level job
title: "flows"
---

# `chainbreaker flows`

Inspect and manage [ClawFlow](/automation/clawflow) jobs.

```bash
chainbreaker flows list
chainbreaker flows show <lookup>
chainbreaker flows cancel <lookup>
```

## Commands

### `flows list`

List tracked flows and their task counts.

```bash
chainbreaker flows list
chainbreaker flows list --status blocked
chainbreaker flows list --json
```

### `flows show`

Show one flow by flow id or owner session key.

```bash
chainbreaker flows show <lookup>
chainbreaker flows show <lookup> --json
```

The output includes the flow status, current step, wait target, blocked summary when present, stored output keys, and linked tasks.

### `flows cancel`

Cancel a flow and any active child tasks.

```bash
chainbreaker flows cancel <lookup>
```

## Related

- [ClawFlow](/automation/clawflow) — job-level orchestration above tasks
- [Background Tasks](/automation/tasks) — detached work ledger
- [CLI reference](/cli/index) — full command tree
