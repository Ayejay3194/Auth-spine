#!/bin/bash
# Script to initialize or update the nlp.js submodule
# This script ensures the nlp.js library is available for integration

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NLP_JS_DIR="$REPO_ROOT/external/nlp.js"

echo "Initializing nlp.js submodule..."

# Initialize and update submodules
cd "$REPO_ROOT"
git submodule update --init --recursive external/nlp.js

# Display repository info
if [ -d "$NLP_JS_DIR" ]; then
  cd "$NLP_JS_DIR"
  echo ""
  echo "✓ nlp.js submodule initialized successfully"
  echo ""
  echo "Repository: $(git remote get-url origin)"
  echo "Current commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
  echo ""
  echo "nlp.js is ready for integration!"
else
  echo "✗ Failed to initialize nlp.js submodule"
  exit 1
fi
