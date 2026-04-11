---
summary: "Uninstall Chainbreaker completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Chainbreaker from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `chainbreaker` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
chainbreaker uninstall
```

Non-interactive (automation / npx):

```bash
chainbreaker uninstall --all --yes --non-interactive
npx -y chainbreaker uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
chainbreaker gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
chainbreaker gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${CHAINBREAKER_STATE_DIR:-$HOME/.chainbreaker}"
```

If you set `CHAINBREAKER_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.chainbreaker/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g chainbreaker
pnpm remove -g chainbreaker
bun remove -g chainbreaker
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Chainbreaker.app
```

Notes:

- If you used profiles (`--profile` / `CHAINBREAKER_PROFILE`), repeat step 3 for each state dir (defaults are `~/.chainbreaker-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `chainbreaker` is missing.

### macOS (launchd)

Default label is `ai.chainbreaker.gateway` (or `ai.chainbreaker.<profile>`; legacy `com.chainbreaker.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.chainbreaker.gateway
rm -f ~/Library/LaunchAgents/ai.chainbreaker.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.chainbreaker.<profile>`. Remove any legacy `com.chainbreaker.*` plists if present.

### Linux (systemd user unit)

Default unit name is `chainbreaker-gateway.service` (or `chainbreaker-gateway-<profile>.service`):

```bash
systemctl --user disable --now chainbreaker-gateway.service
rm -f ~/.config/systemd/user/chainbreaker-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Chainbreaker Gateway` (or `Chainbreaker Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Chainbreaker Gateway"
Remove-Item -Force "$env:USERPROFILE\.chainbreaker\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.chainbreaker-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://chainbreaker.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g chainbreaker@latest`.
Remove it with `npm rm -g chainbreaker` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `chainbreaker ...` / `bun run chainbreaker ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
