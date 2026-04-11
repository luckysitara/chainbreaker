---
summary: "CLI reference for `chainbreaker reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `chainbreaker reset`

Reset local config/state (keeps the CLI installed).

```bash
chainbreaker backup create
chainbreaker reset
chainbreaker reset --dry-run
chainbreaker reset --scope config+creds+sessions --yes --non-interactive
```

Run `chainbreaker backup create` first if you want a restorable snapshot before removing local state.
