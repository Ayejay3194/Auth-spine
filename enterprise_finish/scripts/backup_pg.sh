#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL required}"
TS=$(date +"%Y%m%d_%H%M%S")
OUT_DIR="${1:-./backups}"
mkdir -p "$OUT_DIR"
pg_dump "$DATABASE_URL" > "$OUT_DIR/backup_$TS.sql"
echo "Backup written: $OUT_DIR/backup_$TS.sql"
