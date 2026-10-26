#!/bin/sh
set -eu

dependency_stamp="$(cat package.json package-lock.json | sha256sum | cut -d ' ' -f 1)"
stamp_file="node_modules/.dependency-stamp"

if [ ! -x node_modules/.bin/vite ] || [ "$(cat "$stamp_file" 2>/dev/null || true)" != "$dependency_stamp" ]; then
  npm ci
  printf '%s\n' "$dependency_stamp" > "$stamp_file"
fi

exec npm run dev -- --host 0.0.0.0
