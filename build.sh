#!/usr/bin/env bash
# Production build: Python deps + React UI copied into backend/static
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "==> Installing Python dependencies"
pip install -r backend/requirements.txt

echo "==> Building React frontend"
cd frontend
npm ci
REACT_APP_BACKEND_URL= npm run build

echo "==> Copying UI into backend/static"
mkdir -p ../backend/static
rm -rf ../backend/static/*
cp -r build/* ../backend/static/

if [[ ! -f ../backend/static/index.html ]]; then
  echo "ERROR: backend/static/index.html missing after build" >&2
  exit 1
fi

echo "==> Build complete (dashboard ready at /)"
