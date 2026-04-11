#!/usr/bin/env bash
set -euo pipefail

cd /repo

export CHAINBREAKER_STATE_DIR="/tmp/chainbreaker-test"
export CHAINBREAKER_CONFIG_PATH="${CHAINBREAKER_STATE_DIR}/chainbreaker.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${CHAINBREAKER_STATE_DIR}/credentials"
mkdir -p "${CHAINBREAKER_STATE_DIR}/agents/main/sessions"
echo '{}' >"${CHAINBREAKER_CONFIG_PATH}"
echo 'creds' >"${CHAINBREAKER_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${CHAINBREAKER_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm chainbreaker reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${CHAINBREAKER_CONFIG_PATH}"
test ! -d "${CHAINBREAKER_STATE_DIR}/credentials"
test ! -d "${CHAINBREAKER_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${CHAINBREAKER_STATE_DIR}/credentials"
echo '{}' >"${CHAINBREAKER_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm chainbreaker uninstall --state --yes --non-interactive

test ! -d "${CHAINBREAKER_STATE_DIR}"

echo "OK"
