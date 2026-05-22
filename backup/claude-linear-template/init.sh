#!/bin/bash
# Claude Code + Linear Template Initializer (v2.4)
# Usage: ./init.sh [target-project-directory]
#
# Copies the Linear-powered Claude Code workflow template into a project.
# Detects framework and customizes lint/test/format commands accordingly.
#
# v2.0 — module KB, decision log, plan drift, /retro, /pair, /scan-modules
# v2.1 — /undo, /handoff v2, /batch (parallel worktrees), batch-mode NL rule
# v2.2 — /spec, policy engine (.claude/policies/), /ship preflight
# v2.3 — /health, /watch-pr, /postmortem, scheduled jobs rule
# v2.4 — honesty pass: dropped step-level parallelism in /implement (broken by
#        design), pruned policy vocabulary, reframed /retro /health /ship /pair
#        /handoff /scan-modules /postmortem to match what they actually do,
#        decision log is now command-driven (not judgment-driven), learnings
#        no longer auto-assign severity, /batch gained --dry-run mode,
#        failure-capture Stop hook is now opt-in (was too noisy as default)
#
# Safe to re-run — skips existing files.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-.}"

# Resolve to absolute path
if [ -d "$TARGET" ]; then
  TARGET="$(cd "$TARGET" && pwd)"
else
  echo "Error: Target directory '$TARGET' does not exist."
  exit 1
fi

# ─── Framework detection ───────────────────────────────────────────

detect_framework() {
  if [ -f "$TARGET/next.config.js" ] || [ -f "$TARGET/next.config.ts" ] || [ -f "$TARGET/next.config.mjs" ]; then
    echo "nextjs"
  elif [ -f "$TARGET/vite.config.ts" ] || [ -f "$TARGET/vite.config.js" ]; then
    echo "vite"
  elif [ -f "$TARGET/angular.json" ]; then
    echo "angular"
  elif [ -f "$TARGET/package.json" ] && grep -q '"react"' "$TARGET/package.json" 2>/dev/null; then
    echo "react"
  elif [ -f "$TARGET/pyproject.toml" ] || [ -f "$TARGET/setup.py" ]; then
    echo "python"
  elif [ -f "$TARGET/Gemfile" ]; then
    echo "ruby"
  elif [ -f "$TARGET/go.mod" ]; then
    echo "go"
  elif [ -f "$TARGET/Cargo.toml" ]; then
    echo "rust"
  elif [ -f "$TARGET/package.json" ]; then
    echo "node"
  else
    echo "unknown"
  fi
}

FRAMEWORK=$(detect_framework)

echo "🔧 Claude Code + Linear Workflow (v2.4)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Target:    $TARGET"
echo "🔍 Framework: $FRAMEWORK"
echo ""

# ─── Ask for Linear project prefix ────────────────────────────────

read -p "Linear project prefix (e.g., FA, ENG, APP): " PREFIX
PREFIX="${PREFIX:-PROJ}"
PREFIX_UPPER=$(echo "$PREFIX" | tr '[:lower:]' '[:upper:]')
PREFIX_LOWER=$(echo "$PREFIX" | tr '[:upper:]' '[:lower:]')

echo ""

# ─── Framework-specific settings ──────────────────────────────────

case "$FRAMEWORK" in
  nextjs)
    LINT_CMD="npm run lint -- --quiet"
    TEST_CMD="npm run test"
    TYPE_CMD="npx tsc --noEmit"
    FORMAT_CMD="npx prettier --write \$FILE 2>/dev/null || true"
    LINT_STOP="npm run lint -- --quiet 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS='"Bash(curl http://localhost:*)"'
    ;;
  vite|react)
    LINT_CMD="npm run lint -- --quiet"
    TEST_CMD="npm run test"
    TYPE_CMD="npx tsc --noEmit"
    FORMAT_CMD="npx prettier --write \$FILE 2>/dev/null || true"
    LINT_STOP="npm run lint -- --quiet 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS=""
    ;;
  angular)
    LINT_CMD="npm run lint"
    TEST_CMD="npm run test -- --watch=false"
    TYPE_CMD="npx tsc --noEmit"
    FORMAT_CMD="npx prettier --write \$FILE 2>/dev/null || true"
    LINT_STOP="npm run lint 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS=""
    ;;
  python)
    LINT_CMD="ruff check ."
    TEST_CMD="pytest"
    TYPE_CMD="mypy . || true"
    FORMAT_CMD="ruff format \$FILE 2>/dev/null || true"
    LINT_STOP="ruff check . 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS='"Bash(python *)", "Bash(pytest *)", "Bash(ruff *)", "Bash(mypy *)", "Bash(pip *)"'
    ;;
  ruby)
    LINT_CMD="bundle exec rubocop"
    TEST_CMD="bundle exec rspec"
    TYPE_CMD=""
    FORMAT_CMD="bundle exec rubocop -a \$FILE 2>/dev/null || true"
    LINT_STOP="bundle exec rubocop 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS='"Bash(bundle *)", "Bash(rails *)", "Bash(rake *)"'
    ;;
  go)
    LINT_CMD="golangci-lint run"
    TEST_CMD="go test ./..."
    TYPE_CMD=""
    FORMAT_CMD="gofmt -w \$FILE 2>/dev/null || true"
    LINT_STOP="golangci-lint run 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS='"Bash(go *)"'
    ;;
  rust)
    LINT_CMD="cargo clippy"
    TEST_CMD="cargo test"
    TYPE_CMD=""
    FORMAT_CMD="rustfmt \$FILE 2>/dev/null || true"
    LINT_STOP="cargo clippy 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS='"Bash(cargo *)"'
    ;;
  *)
    LINT_CMD="npm run lint -- --quiet 2>/dev/null || true"
    TEST_CMD="npm run test 2>/dev/null || true"
    TYPE_CMD=""
    FORMAT_CMD="npx prettier --write \$FILE 2>/dev/null || true"
    LINT_STOP="npm run lint -- --quiet 2>&1 | tail -20 || true"
    EXTRA_PERMISSIONS=""
    ;;
esac

# ─── Stop hook: lint summary (v2.4: reverted to simple tail) ──────
# The v2.1 failure-capture hook was too noisy as a default — running lint on
# every turn slowed sessions and the buffer filled with unrelated failures.
# v2.4 default: just show the last 20 lines of lint output on Stop, same as v2.0.
#
# To enable failure-capture opt-in: edit .claude/settings.json after init and
# replace the Stop hook command with:
#   OUT=$(<LINT_CMD> 2>&1); CODE=$?; if [ $CODE -ne 0 ]; then { echo "## $(date -u +%Y-%m-%dT%H:%M:%SZ) — lint exit=$CODE"; echo "$OUT" | tail -40; echo ""; } >> .claude/pending-learnings.txt; fi
# The auto-context rule reads .claude/pending-learnings.txt at session start
# if it's non-empty. Use opt-in if you want that; leave as default otherwise.

# ─── Create directory structure ───────────────────────────────────

mkdir -p \
  "$TARGET/.claude/commands" \
  "$TARGET/.claude/agents" \
  "$TARGET/.claude/rules" \
  "$TARGET/.claude/learnings" \
  "$TARGET/.claude/learnings/archive" \
  "$TARGET/.claude/policies" \
  "$TARGET/.claude/batches" \
  "$TARGET/.claude/health" \
  "$TARGET/.claude/retros" \
  "$TARGET/.claude/watch-pr" \
  "$TARGET/docs/plans" \
  "$TARGET/docs/specs" \
  "$TARGET/docs/modules" \
  "$TARGET/docs/postmortems"

copy_if_missing() {
  local src="$1" dst="$2" label="$3"
  if [ -f "$dst" ]; then
    echo "   ⏭  $label (exists)"
  else
    cp "$src" "$dst"
    # Replace PROJ placeholder with actual prefix
    if command -v sed &>/dev/null; then
      sed -i '' "s/PROJ-/${PREFIX_UPPER}-/g; s/proj-/${PREFIX_LOWER}-/g; s/\[PROJ\]/[${PREFIX_UPPER}]/g" "$dst" 2>/dev/null || \
      sed -i "s/PROJ-/${PREFIX_UPPER}-/g; s/proj-/${PREFIX_LOWER}-/g; s/\[PROJ\]/[${PREFIX_UPPER}]/g" "$dst" 2>/dev/null || true
    fi
    echo "   ✅ $label"
  fi
}

echo "📂 Commands:"
for f in "$SCRIPT_DIR/.claude/commands/"*.md; do
  fname="$(basename "$f")"
  copy_if_missing "$f" "$TARGET/.claude/commands/$fname" ".claude/commands/$fname"
done

echo "📂 Agents:"
for f in "$SCRIPT_DIR/.claude/agents/"*.md; do
  fname="$(basename "$f")"
  copy_if_missing "$f" "$TARGET/.claude/agents/$fname" ".claude/agents/$fname"
done

echo "📂 Rules:"
for f in "$SCRIPT_DIR/.claude/rules/"*.md; do
  fname="$(basename "$f")"
  copy_if_missing "$f" "$TARGET/.claude/rules/$fname" ".claude/rules/$fname"
done

echo "📂 Policies (examples):"
for f in "$SCRIPT_DIR/.claude/policies/"*.md; do
  fname="$(basename "$f")"
  copy_if_missing "$f" "$TARGET/.claude/policies/$fname" ".claude/policies/$fname"
done

# ─── Generate settings.json with framework-specific config ────────

if [ -f "$TARGET/.claude/settings.json" ]; then
  echo ""
  echo "⏭  .claude/settings.json exists — not overwriting"
  echo "   💡 Consider adding these hooks manually (see docs):"
  echo "      PostToolUse (Edit): $FORMAT_CMD"
  echo "      Stop (capture failures): see init.sh CAPTURE_HOOK"
else
  # Build extra permissions line
  EXTRA_LINE=""
  if [ -n "$EXTRA_PERMISSIONS" ]; then
    EXTRA_LINE="      $EXTRA_PERMISSIONS,"
  fi

  cat > "$TARGET/.claude/settings.json" << SETTINGS_EOF
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git worktree *)",
      "Bash(git revert *)",
      "Bash(git blame *)",
      "Bash(gh pr *)",
      "Bash(gh api *)",
      "Bash(gh issue *)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(find *)",
      "Bash(grep *)",
${EXTRA_LINE}
      "Edit",
      "Write"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "event": "Edit",
        "command": "$FORMAT_CMD"
      }
    ],
    "Stop": [
      {
        "command": "$LINT_STOP"
      }
    ]
  }
}
SETTINGS_EOF
  echo ""
  echo "✅ .claude/settings.json (configured for $FRAMEWORK with failure-capture hook)"
fi

# ─── Generate .mcp.json ──────────────────────────────────────────

if [ -f "$TARGET/.mcp.json" ]; then
  echo ""
  echo "⚠️  .mcp.json exists. Ensure it includes the Linear server:"
  echo '   "linear": { "command": "npx", "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"] }'
else
  cp "$SCRIPT_DIR/.mcp.json" "$TARGET/.mcp.json"
  echo "✅ .mcp.json (Linear + Context7 MCP servers)"
fi

# ─── Initialize state.json ────────────────────────────────────────

if [ ! -f "$TARGET/.claude/state.json" ]; then
  cat > "$TARGET/.claude/state.json" << 'STATE_EOF'
{
  "currentIssue": null,
  "currentBranch": null,
  "planFile": null,
  "specFile": null,
  "handoffFile": null,
  "currentStep": null,
  "totalSteps": null,
  "confidence": {},
  "prUrl": null,
  "handoffNotes": null,
  "lastActivityTimestamp": null,
  "lastUndoAt": null,
  "lastUndoReason": null
}
STATE_EOF
  echo "✅ .claude/state.json (empty state, v2.1 schema)"
fi

# ─── Initialize learnings directory ───────────────────────────────

if [ ! -f "$TARGET/.claude/learnings/.gitkeep" ]; then
  touch "$TARGET/.claude/learnings/.gitkeep"
  echo "✅ .claude/learnings/ (ready)"
fi

# ─── v2.1: Pending-learnings buffer ───────────────────────────────

if [ ! -f "$TARGET/.claude/pending-learnings.txt" ]; then
  touch "$TARGET/.claude/pending-learnings.txt"
  echo "✅ .claude/pending-learnings.txt (failure-capture buffer)"
fi

# ─── Initialize decisions log (v2) ────────────────────────────────

if [ ! -f "$TARGET/.claude/decisions.jsonl" ]; then
  touch "$TARGET/.claude/decisions.jsonl"
  echo "✅ .claude/decisions.jsonl (append-only decision log)"
fi

# ─── Initialize module knowledge base (v2) ────────────────────────

if [ ! -f "$TARGET/docs/modules/README.md" ]; then
  cat > "$TARGET/docs/modules/README.md" << 'MODULES_EOF'
# Module Knowledge Base

This directory documents feature areas of the project. Each module doc is auto-loaded by a matching `.claude/rules/ctx-*.md` rule when Claude edits files in that area.

Run `/scan-modules` to bootstrap an initial set of module docs by analyzing the codebase. Review and refine the output — it's a starting point, not a finished artifact.

See `.claude/rules/module-context.md` for format and update guidelines.

## Modules

_(populated by `/scan-modules` or created manually)_
MODULES_EOF
  echo "✅ docs/modules/ (ready — run /scan-modules to bootstrap)"
fi

# ─── v2.2: Specs directory ────────────────────────────────────────

if [ ! -f "$TARGET/docs/specs/README.md" ]; then
  cat > "$TARGET/docs/specs/README.md" << 'SPECS_EOF'
# Specs

Structured acceptance criteria for issues. Written with `/spec <issue>` before planning or coding.

A spec pins down WHAT success looks like. The most valuable field is "non-goals" — it's what prevents scope creep mid-implementation.

See `.claude/commands/spec.md` for format.

## When to write a spec

- Auth, payments, permissions, data migrations, other high-stakes changes
- Issues with one-sentence descriptions that need expansion
- Issues with multiple stakeholders or unclear trade-offs
- Anything being batched (`/batch` sub-agents can't ask clarifying questions)

Spec-first flow: `/spec` → `/plan` → `/implement` → `/ship`
SPECS_EOF
  echo "✅ docs/specs/ (ready)"
fi

# ─── v2.3: Postmortems directory ──────────────────────────────────

if [ ! -f "$TARGET/docs/postmortems/README.md" ]; then
  cat > "$TARGET/docs/postmortems/README.md" << 'PM_EOF'
# Postmortems

Written with `/postmortem <incident>` after production incidents. Each postmortem reconstructs the failure, identifies the root cause, captures high-severity learnings, and proposes policies to prevent recurrence.

Blameless. Focus on systems, not individuals. Every postmortem produces at least one action item.

See `.claude/commands/postmortem.md` for format.
PM_EOF
  echo "✅ docs/postmortems/ (ready)"
fi

# ─── Create docs/plans if needed ──────────────────────────────────

echo "✅ docs/plans/ (ready)"

# ─── Update .gitignore ────────────────────────────────────────────

if [ -f "$TARGET/.gitignore" ]; then
  GITIGNORE_ADDED=0
  if ! grep -q ".claude/state.json" "$TARGET/.gitignore" 2>/dev/null; then
    echo "" >> "$TARGET/.gitignore"
    echo "# Claude Code local state (gitignored — per-developer)" >> "$TARGET/.gitignore"
    echo ".claude/state.json" >> "$TARGET/.gitignore"
    echo ".claude/pending-learnings.txt" >> "$TARGET/.gitignore"
    echo ".claude/watch-pr/" >> "$TARGET/.gitignore"
    echo ".claude/batches/" >> "$TARGET/.gitignore"
    GITIGNORE_ADDED=1
  fi
  if [ $GITIGNORE_ADDED -eq 1 ]; then
    echo "✅ Added local-only paths to .gitignore"
    echo "   (state.json, pending-learnings.txt, watch-pr/, batches/)"
    echo "   NOTE: decisions.jsonl, learnings/, policies/, modules/ ARE committed"
  fi
fi

# ─── Show CLAUDE.md snippet ──────────────────────────────────────

SNIPPET="$SCRIPT_DIR/CLAUDE_SNIPPET.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Add this to your CLAUDE.md:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Show with prefix replaced
sed "s/PROJ-/${PREFIX_UPPER}-/g; s/proj-/${PREFIX_LOWER}-/g; s/\[PROJ\]/[${PREFIX_UPPER}]/g" "$SNIPPET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Done ─────────────────────────────────────────────────────────

echo ""
echo "🔑 Next steps:"
echo "   1. Add the snippet above to your project's CLAUDE.md"
echo "   2. Start Claude Code — Linear MCP will prompt you to authenticate"
echo "   3. Run /sync to pull your Linear issues"
echo "   4. Run /scan-modules to bootstrap docs/modules/"
echo "   5. Review example policies in .claude/policies/ — keep, edit, or delete"
echo "   6. Run /pull-task for a single issue, or /batch for multiple in parallel"
echo ""
echo "📚 Read BATCH_GUIDE.md for how to run multiple issues in parallel worktrees."
echo ""
echo "✨ Setup complete! Available commands:"
echo ""
echo "   Core workflow:"
echo "   /pull-task         Pull + plan + branch for one issue"
echo "   /batch             Run multiple issues in parallel worktrees (v2.1)"
echo "   /spec              Write acceptance criteria (v2.2)"
echo "   /plan              Create implementation plan with step DAG"
echo "   /implement         Execute ready plan step(s) — parallel when DAG allows"
echo "   /pair              Implement with a parallel reviewer agent"
echo "   /continue          Resume work"
echo "   /ship              Preflight + create PR with Linear linking"
echo "   /handoff           Write continuity doc for next session (v2.1)"
echo "   /undo              Safely revert the last implement step (v2.1)"
echo ""
echo "   Task management:"
echo "   /sync              Linear dashboard + state sync"
echo "   /push-task         Create new Linear issue"
echo "   /split-tasks       Decompose feature/plan into detailed Linear tasks"
echo ""
echo "   Knowledge & retro:"
echo "   /scan-modules      Bootstrap docs/modules/ from the codebase"
echo "   /retro             Analyze workflow, propose template improvements"
echo "   /health            Codebase + workflow health snapshot (v2.3)"
echo ""
echo "   Quality:"
echo "   /review            Review changes against conventions"
echo "   /review-feedback   Address PR review comments"
echo "   /watch-pr          Poll PR for new review comments, classify, propose fixes (v2.3)"
echo "   /fix-issue         Fix a bug with root cause analysis"
echo "   /postmortem        Reconstruct production incident, capture learnings (v2.3)"
echo ""
echo "   Framework: $FRAMEWORK | Prefix: $PREFIX_UPPER"
