---
summary: "Run Chainbreaker in a rootless Podman container"
read_when:
  - You want a containerized gateway with Podman instead of Docker
title: "Podman"
---

# Podman

Run the Chainbreaker Gateway in a rootless Podman container, managed by your current non-root user.

The intended model is:

- Podman runs the gateway container.
- Your host `chainbreaker` CLI is the control plane.
- Persistent state lives on the host under `~/.chainbreaker` by default.
- Day-to-day management uses `chainbreaker --container <name> ...` instead of `sudo -u chainbreaker`, `podman exec`, or a separate service user.

## Prerequisites

- **Podman** in rootless mode
- **Chainbreaker CLI** installed on the host
- **Optional:** `systemd --user` if you want Quadlet-managed auto-start
- **Optional:** `sudo` only if you want `loginctl enable-linger "$(whoami)"` for boot persistence on a headless host

## Quick start

<Steps>
  <Step title="One-time setup">
    From the repo root, run `./scripts/podman/setup.sh`.
  </Step>

  <Step title="Start the Gateway container">
    Start the container with `./scripts/run-chainbreaker-podman.sh launch`.
  </Step>

  <Step title="Run onboarding inside the container">
    Run `./scripts/run-chainbreaker-podman.sh launch setup`, then open `http://127.0.0.1:18789/`.
  </Step>

  <Step title="Manage the running container from the host CLI">
    Set `CHAINBREAKER_CONTAINER=chainbreaker`, then use normal `chainbreaker` commands from the host.
  </Step>
</Steps>

Setup details:

- `./scripts/podman/setup.sh` builds `chainbreaker:local` in your rootless Podman store by default, or uses `CHAINBREAKER_IMAGE` / `CHAINBREAKER_PODMAN_IMAGE` if you set one.
- It creates `~/.chainbreaker/chainbreaker.json` with `gateway.mode: "local"` if missing.
- It creates `~/.chainbreaker/.env` with `CHAINBREAKER_GATEWAY_TOKEN` if missing.
- For manual launches, the helper reads only a small allowlist of Podman-related keys from `~/.chainbreaker/.env` and passes explicit runtime env vars to the container; it does not hand the full env file to Podman.

Quadlet-managed setup:

```bash
./scripts/podman/setup.sh --quadlet
```

Quadlet is a Linux-only option because it depends on systemd user services.

You can also set `CHAINBREAKER_PODMAN_QUADLET=1`.

Optional build/setup env vars:

- `CHAINBREAKER_IMAGE` or `CHAINBREAKER_PODMAN_IMAGE` -- use an existing/pulled image instead of building `chainbreaker:local`
- `CHAINBREAKER_DOCKER_APT_PACKAGES` -- install extra apt packages during image build
- `CHAINBREAKER_EXTENSIONS` -- pre-install extension dependencies at build time

Container start:

```bash
./scripts/run-chainbreaker-podman.sh launch
```

The script starts the container as your current uid/gid with `--userns=keep-id` and bind-mounts your Chainbreaker state into the container.

Onboarding:

```bash
./scripts/run-chainbreaker-podman.sh launch setup
```

Then open `http://127.0.0.1:18789/` and use the token from `~/.chainbreaker/.env`.

Host CLI default:

```bash
export CHAINBREAKER_CONTAINER=chainbreaker
```

Then commands such as these will run inside that container automatically:

```bash
chainbreaker dashboard --no-open
chainbreaker gateway status --deep
chainbreaker doctor
chainbreaker channels login
```

On macOS, Podman machine may make the browser appear non-local to the gateway.
If the Control UI reports device-auth errors after launch, prefer the SSH
tunnel flow in [macOS Podman SSH tunnel](#macos-podman-ssh-tunnel). For
remote HTTPS access, use the Tailscale guidance in
[Podman + Tailscale](#podman--tailscale).

## macOS Podman SSH tunnel

On macOS, Podman machine can make the browser appear non-local to the gateway even when the published port is only on `127.0.0.1`.

For local browser access, use an SSH tunnel into the Podman VM and open the tunneled localhost port instead.

Recommended local tunnel port:

- `28889` on the Mac host
- forwarded to `127.0.0.1:18789` inside the Podman VM

Start the tunnel in a separate terminal:

```bash
ssh -N \
  -i ~/.local/share/containers/podman/machine/machine \
  -p <podman-vm-ssh-port> \
  -L 28889:127.0.0.1:18789 \
  core@127.0.0.1
```

In that command, `<podman-vm-ssh-port>` is the Podman VM's SSH port on the Mac host. Check your current value with:

```bash
podman system connection list
```

Allow the tunneled browser origin once. This is required the first time you use the tunnel because the launcher can auto-seed the Podman-published port, but it cannot infer your chosen browser tunnel port:

```bash
CHAINBREAKER_CONTAINER=chainbreaker chainbreaker config set gateway.controlUi.allowedOrigins \
  '["http://127.0.0.1:18789","http://localhost:18789","http://127.0.0.1:28889","http://localhost:28889"]' \
  --strict-json
podman restart chainbreaker
```

That is a one-time step for the default `28889` tunnel.

Then open:

```text
http://127.0.0.1:28889/
```

Notes:

- `18789` is usually already occupied on the Mac host by the Podman-published gateway port, so the tunnel uses `28889` as the local browser port.
- If the UI asks for pairing approval, prefer explicit container-targeted or explicit-URL commands so the host CLI does not fall back to local pairing files:

```bash
chainbreaker --container chainbreaker devices list
chainbreaker --container chainbreaker devices approve --latest
```

- Equivalent explicit-URL form:

```bash
chainbreaker devices list \
  --url ws://127.0.0.1:28889 \
  --token "$(sed -n 's/^CHAINBREAKER_GATEWAY_TOKEN=//p' ~/.chainbreaker/.env | head -n1)"
```

<a id="podman--tailscale"></a>

## Podman + Tailscale

For HTTPS or remote browser access, follow the main Tailscale docs.

Podman-specific note:

- Keep the Podman publish host at `127.0.0.1`.
- Prefer host-managed `tailscale serve` over `chainbreaker gateway --tailscale serve`.
- For local macOS browser access without HTTPS, prefer the SSH tunnel section above.

See:

- [Tailscale](/gateway/tailscale)
- [Control UI](/web/control-ui)

## Systemd (Quadlet, optional)

If you ran `./scripts/podman/setup.sh --quadlet`, setup installs a Quadlet file at:

```bash
~/.config/containers/systemd/chainbreaker.container
```

Useful commands:

- **Start:** `systemctl --user start chainbreaker.service`
- **Stop:** `systemctl --user stop chainbreaker.service`
- **Status:** `systemctl --user status chainbreaker.service`
- **Logs:** `journalctl --user -u chainbreaker.service -f`

After editing the Quadlet file:

```bash
systemctl --user daemon-reload
systemctl --user restart chainbreaker.service
```

For boot persistence on SSH/headless hosts, enable lingering for your current user:

```bash
sudo loginctl enable-linger "$(whoami)"
```

## Config, env, and storage

- **Config dir:** `~/.chainbreaker`
- **Workspace dir:** `~/.chainbreaker/workspace`
- **Token file:** `~/.chainbreaker/.env`
- **Launch helper:** `./scripts/run-chainbreaker-podman.sh`

The launch script and Quadlet bind-mount host state into the container:

- `CHAINBREAKER_CONFIG_DIR` -> `/home/node/.chainbreaker`
- `CHAINBREAKER_WORKSPACE_DIR` -> `/home/node/.chainbreaker/workspace`

By default those are host directories, not anonymous container state, so config and workspace survive container replacement.
The Podman setup also seeds `gateway.controlUi.allowedOrigins` for `127.0.0.1` and `localhost` on the published gateway port so the local dashboard works with the container's non-loopback bind.

Useful env vars for the manual launcher:

- `CHAINBREAKER_PODMAN_CONTAINER` -- container name (`chainbreaker` by default)
- `CHAINBREAKER_PODMAN_IMAGE` / `CHAINBREAKER_IMAGE` -- image to run
- `CHAINBREAKER_PODMAN_GATEWAY_HOST_PORT` -- host port mapped to container `18789`
- `CHAINBREAKER_PODMAN_BRIDGE_HOST_PORT` -- host port mapped to container `18790`
- `CHAINBREAKER_PODMAN_PUBLISH_HOST` -- host interface for published ports; default is `127.0.0.1`
- `CHAINBREAKER_GATEWAY_BIND` -- gateway bind mode inside the container; default is `lan`
- `CHAINBREAKER_PODMAN_USERNS` -- `keep-id` (default), `auto`, or `host`

The manual launcher reads `~/.chainbreaker/.env` before finalizing container/image defaults, so you can persist these there.

If you use a non-default `CHAINBREAKER_CONFIG_DIR` or `CHAINBREAKER_WORKSPACE_DIR`, set the same variables for both `./scripts/podman/setup.sh` and later `./scripts/run-chainbreaker-podman.sh launch` commands. The repo-local launcher does not persist custom path overrides across shells.

Quadlet note:

- The generated Quadlet service intentionally keeps a fixed, hardened default shape: `127.0.0.1` published ports, `--bind lan` inside the container, and `keep-id` user namespace.
- It still reads `~/.chainbreaker/.env` for gateway runtime env such as `CHAINBREAKER_GATEWAY_TOKEN`, but it does not consume the manual launcher's Podman-specific override allowlist.
- If you need custom publish ports, publish host, or other container-run flags, use the manual launcher or edit `~/.config/containers/systemd/chainbreaker.container` directly, then reload and restart the service.

## Useful commands

- **Container logs:** `podman logs -f chainbreaker`
- **Stop container:** `podman stop chainbreaker`
- **Remove container:** `podman rm -f chainbreaker`
- **Open dashboard URL from host CLI:** `chainbreaker dashboard --no-open`
- **Health/status via host CLI:** `chainbreaker gateway status --deep`

## Troubleshooting

- **Permission denied (EACCES) on config or workspace:** The container runs with `--userns=keep-id` and `--user <your uid>:<your gid>` by default. Ensure the host config/workspace paths are owned by your current user.
- **Gateway start blocked (missing `gateway.mode=local`):** Ensure `~/.chainbreaker/chainbreaker.json` exists and sets `gateway.mode="local"`. `scripts/podman/setup.sh` creates this if missing.
- **Container CLI commands hit the wrong target:** Use `chainbreaker --container <name> ...` explicitly, or export `CHAINBREAKER_CONTAINER=<name>` in your shell.
- **`chainbreaker update` fails with `--container`:** Expected. Rebuild/pull the image, then restart the container or the Quadlet service.
- **Quadlet service does not start:** Run `systemctl --user daemon-reload`, then `systemctl --user start chainbreaker.service`. On headless systems you may also need `sudo loginctl enable-linger "$(whoami)"`.
- **SELinux blocks bind mounts:** Leave the default mount behavior alone; the launcher auto-adds `:Z` on Linux when SELinux is enforcing or permissive.

## Related

- [Docker](/install/docker)
- [Gateway background process](/gateway/background-process)
- [Gateway troubleshooting](/gateway/troubleshooting)
