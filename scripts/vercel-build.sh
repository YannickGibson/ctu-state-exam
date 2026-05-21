#!/usr/bin/env bash
# Vercel build entrypoint. Ensures the private content submodule (sources/) is
# fetched using GH_SUBMODULE_TOKEN, then runs the normal client build + static
# copy. Vercel's automatic submodule fetch via the GitHub App is unreliable for
# private submodules, so we re-do it explicitly here.
set -euo pipefail

if [ -f .gitmodules ]; then
  if [ -n "${GH_SUBMODULE_TOKEN:-}" ]; then
    git config --global "url.https://x-access-token:${GH_SUBMODULE_TOKEN}@github.com/.insteadOf" "https://github.com/"
  fi
  git submodule sync --recursive || true
  git submodule update --init --recursive --force || echo "vercel-build: submodule update failed; copy-static.js will fail-fast if content is missing." >&2
fi

npm --prefix client install
npm --prefix client run build
node scripts/copy-static.js
