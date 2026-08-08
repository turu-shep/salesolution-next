#!/usr/bin/env bash
#
# ai-stack-install.sh — Artur's Claude Code skill stack, one command.
#
#   Global (new machine):   ./ai-stack-install.sh
#   Into current project:   ./ai-stack-install.sh --project
#   Refresh everything:     ./ai-stack-install.sh --update
#   Skip heavy packs:       ./ai-stack-install.sh --skip ecc,karpathy
#   ECC rules selection:    ./ai-stack-install.sh --ecc-rules "common typescript php python"
#   Motion AI Kit (opt-in): ./ai-stack-install.sh --motion         (interactive; Motion+ required)
#   21st MCP key:           export TWENTYFIRST_API_KEY=...         (key from https://21st.dev/mcp)
#   Show packs:             ./ai-stack-install.sh --list
#
# What it installs (as Claude Code PLUGINS -> global, hook-aware, auto-managed):
#   superpowers   obra/superpowers                      brainstorm -> plan -> subagent TDD methodology (+hooks)
#   mattpocock    mattpocock/skills                     /grill-me, /tdd, /code-review, /to-spec, /triage
#   makerskills   coreyhaines31/makerskills             decide, deep-research, second-brain, pm, slide-deck
#   marketing     coreyhaines31/marketingskills         44 skills: cro, copywriting, seo, ads, emails, pricing
#   karpathy      multica-ai/andrej-karpathy-skills     4 anti-slop principles (think first, surgical diffs)
#   uiux          nextlevelbuilder/ui-ux-pro-max-skill  design intelligence: 84 styles, palettes, typography
#   ecc           affaan-m/ECC                          67 agents + 279 skills + hooks (HEAVY — see AI-STACK.md)
#
# MCP layer (user scope — global across projects):
#   21st          https://21st.dev/api/mcp              search 10k+ React/Tailwind components + generate UI
#   motion        npx motion-ai (Motion+ required)      Motion docs/examples MCP + skills + CSS spring gen
#
# Plugins are the fastest correct path: one-time per machine, global across all
# projects, ship hooks/agents/commands (copying folders would lose those), and
# update from upstream. Requires Claude Code CLI >= 2.1. Never mix the plugin
# path with ECC's manual install.sh (their docs are explicit about this).
#
# macOS (bash 3.2), Linux, and WSL compatible.

set -u

# ---------- output ----------
if [ -t 1 ]; then
  B="$(printf '\033[1m')"; G="$(printf '\033[32m')"; Y="$(printf '\033[33m')"
  R="$(printf '\033[31m')"; N="$(printf '\033[0m')"
else
  B=""; G=""; Y=""; R=""; N=""
fi
ok()   { printf "  %s✓%s %s\n" "$G" "$N" "$1"; }
warn() { printf "  %s!%s %s\n" "$Y" "$N" "$1"; }
bad()  { printf "  %s✗%s %s\n" "$R" "$N" "$1"; }
say()  { printf "\n%s%s%s\n" "$B" "$1" "$N"; }
have() { command -v "$1" >/dev/null 2>&1; }

# ---------- pack registry (id | marketplace source | install slugs | label) ----------
ALL_IDS="superpowers mattpocock makerskills marketing karpathy uiux ecc"

pack_src() {
  case "$1" in
    superpowers) echo "OFFICIAL" ;;                                # official Anthropic marketplace
    mattpocock)  echo "mattpocock/skills" ;;
    makerskills) echo "coreyhaines31/makerskills" ;;
    marketing)   echo "coreyhaines31/marketingskills" ;;
    karpathy)    echo "multica-ai/andrej-karpathy-skills" ;;
    uiux)        echo "nextlevelbuilder/ui-ux-pro-max-skill" ;;
    ecc)         echo "https://github.com/affaan-m/ECC" ;;
  esac
}
pack_slugs() {  # comma-separated candidates, tried in order
  case "$1" in
    superpowers) echo "superpowers@claude-plugins-official" ;;
    mattpocock)  echo "mattpocock-skills@mattpocock" ;;
    makerskills) echo "makerskills@makerskills" ;;
    marketing)   echo "marketing-skills,marketing-skills@marketingskills" ;;
    karpathy)    echo "andrej-karpathy-skills@karpathy-skills" ;;
    uiux)        echo "ui-ux-pro-max@ui-ux-pro-max-skill" ;;
    ecc)         echo "ecc@ecc" ;;
  esac
}
pack_label() {
  case "$1" in
    superpowers) echo "Superpowers (dev methodology + hooks)" ;;
    mattpocock)  echo "Matt Pocock engineering skills" ;;
    makerskills) echo "Makerskills (founder/operator skills)" ;;
    marketing)   echo "Marketing Skills (44 skills)" ;;
    karpathy)    echo "Karpathy coding guidelines" ;;
    uiux)        echo "UI/UX Pro Max (design intelligence)" ;;
    ecc)         echo "ECC (67 agents / 279 skills / hooks)" ;;
  esac
}

# Per-project vendoring targets (superpowers + ECC excluded: hook-driven, global-only)
PROJECT_REPOS="mattpocock/skills coreyhaines31/marketingskills coreyhaines31/makerskills multica-ai/andrej-karpathy-skills nextlevelbuilder/ui-ux-pro-max-skill"

# ---------- args ----------
MODE="global"; UPDATE=0; SKIP=""; ECC_RULES="common typescript php"; MOTION=0
while [ $# -gt 0 ]; do
  case "$1" in
    --project)   MODE="project" ;;
    --update)    UPDATE=1 ;;
    --motion)    MOTION=1 ;;
    --skip)      shift; SKIP="$(printf '%s' "${1:-}" | tr ',' ' ')" ;;
    --ecc-rules) shift; ECC_RULES="${1:-}" ;;
    --list)
      for id in $ALL_IDS; do printf "  %-12s %-42s %s\n" "$id" "$(pack_src "$id")" "$(pack_label "$id")"; done
      printf "  %-12s %-42s %s\n" "21st" "https://21st.dev/api/mcp (HTTP MCP)" "10k+ components search + UI generation"
      printf "  %-12s %-42s %s\n" "motion" "npx motion-ai (Motion+)" "Motion AI Kit: docs MCP + skills"
      exit 0 ;;
    -h|--help)   sed -n '2,33p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) bad "unknown option: $1 (see --help)"; exit 1 ;;
  esac
  shift
done
skipped() { case " $SKIP " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }

INSTALLED=0; FAILED=0; SKIPPED=0

# ---------- helpers ----------
add_marketplace() {  # $1 = source ("OFFICIAL" is a no-op)
  [ "$1" = "OFFICIAL" ] && return 0
  if claude plugin marketplace add "$1" >/dev/null 2>&1; then
    ok "marketplace added: $1"
  else
    warn "marketplace $1 already registered (or add returned non-zero) — continuing"
  fi
}

try_install() {  # $1 = pack id ; returns 0 on success
  slugs="$(pack_slugs "$1")"
  for slug in $(printf '%s' "$slugs" | tr ',' ' '); do
    if claude plugin install "$slug" >/dev/null 2>&1; then
      ok "$(pack_label "$1")  [$slug]"
      return 0
    fi
  done
  # Superpowers fallback: self-hosted marketplace if the official one is unavailable
  if [ "$1" = "superpowers" ]; then
    claude plugin marketplace add obra/superpowers-marketplace >/dev/null 2>&1 || true
    if claude plugin install superpowers@superpowers-marketplace >/dev/null 2>&1; then
      ok "$(pack_label "$1")  [superpowers@superpowers-marketplace]"
      return 0
    fi
  fi
  return 1
}

install_ecc_rules() {
  # ECC's plugin cannot ship rules/ (Claude Code plugin limitation), so we copy
  # only the language packs we actually use into ~/.claude/rules/ecc/.
  [ -z "$ECC_RULES" ] || [ "$ECC_RULES" = "none" ] && { warn "ECC rules: skipped by request"; return 0; }
  have git || { bad "git not found — cannot copy ECC rules"; return 1; }
  tmp="$(mktemp -d)"
  if git clone --depth 1 --filter=blob:none --sparse https://github.com/affaan-m/ECC "$tmp/ECC" >/dev/null 2>&1 \
     && git -C "$tmp/ECC" sparse-checkout set rules >/dev/null 2>&1; then
    mkdir -p "$HOME/.claude/rules/ecc"
    copied=""
    for r in $ECC_RULES; do
      if [ -d "$tmp/ECC/rules/$r" ]; then
        rm -rf "$HOME/.claude/rules/ecc/$r"
        cp -R "$tmp/ECC/rules/$r" "$HOME/.claude/rules/ecc/$r"
        copied="$copied $r"
      else
        warn "ECC rules pack not found upstream: $r"
      fi
    done
    [ -n "$copied" ] && ok "ECC rules ->  ~/.claude/rules/ecc  (packs:$copied)"
  else
    bad "could not fetch ECC rules (network/git issue)"
  fi
  rm -rf "$tmp"
}

setup_21st_mcp() {
  # 21st MCP: plain HTTP server, user scope = global. Fresh key required from
  # https://21st.dev/mcp (old Magic keys were all reset when the backends merged).
  if skipped 21st; then warn "skipped: 21st MCP"; SKIPPED=$((SKIPPED+1)); return 0; fi
  key="${TWENTYFIRST_API_KEY:-${TWENTY_FIRST_API_KEY:-}}"
  if claude mcp get 21st >/dev/null 2>&1; then
    if [ "$UPDATE" = 1 ] && [ -n "$key" ]; then
      claude mcp remove 21st --scope user >/dev/null 2>&1 || true
    else
      ok "21st MCP already configured (user scope)"
      return 0
    fi
  fi
  if [ -z "$key" ]; then
    warn "21st MCP: no key. Get one at https://21st.dev/mcp, then:  export TWENTYFIRST_API_KEY=...  and re-run"
    return 0
  fi
  # NOTE: --header is variadic — it must come AFTER the name/url positionals
  # or it swallows them ("error: missing required argument 'name'").
  if claude mcp add 21st https://21st.dev/api/mcp --transport http --scope user --header "x-api-key: $key" >/dev/null 2>&1; then
    ok "21st MCP (10k+ component search + UI generation) — user scope"
    INSTALLED=$((INSTALLED+1))
  else
    bad "21st MCP add failed — manual: claude mcp add 21st https://21st.dev/api/mcp --transport http --scope user --header \"x-api-key: <key>\""
    FAILED=$((FAILED+1))
  fi
}

setup_motion_kit() {
  # Motion AI Kit (docs/examples MCP + skills + CSS spring generation). Its
  # installer is interactive and requires a Motion+ API key, so it is opt-in.
  if skipped motion; then warn "skipped: Motion AI Kit"; SKIPPED=$((SKIPPED+1)); return 0; fi
  if [ "$MOTION" != 1 ]; then
    warn "Motion AI Kit: opt-in (Motion+ required). Run with --motion, or later:  npx motion-ai"
    return 0
  fi
  if [ ! -t 0 ]; then
    warn "Motion AI Kit installer is interactive — run 'npx motion-ai' in a terminal (key: motion.dev/dashboard/tokens)"
    return 0
  fi
  say "Motion AI Kit (interactive — have your Motion+ API key ready)"
  if npx -y motion-ai; then
    ok "Motion AI Kit installed"; INSTALLED=$((INSTALLED+1))
  else
    bad "Motion AI Kit did not complete (needs Motion+; key from motion.dev/dashboard/tokens)"; FAILED=$((FAILED+1))
  fi
}

# ---------- project mode ----------
if [ "$MODE" = "project" ]; then
  say "Vendoring skills into $(pwd) (committed with the repo, editable per-client)"
  have npx || { bad "npx not found — install Node.js first"; exit 1; }
  for repo in $PROJECT_REPOS; do
    id_hint="$(basename "$repo")"
    if skipped "$id_hint" || skipped "$(echo "$repo" | cut -d/ -f1)"; then
      warn "skipped: $repo"; SKIPPED=$((SKIPPED+1)); continue
    fi
    printf "  … %s\n" "$repo"
    if npx -y skills@latest add "$repo" -a claude-code </dev/null >/dev/null 2>&1; then
      ok "$repo -> .claude/skills/"; INSTALLED=$((INSTALLED+1))
    else
      bad "$repo (run manually: npx skills add $repo -a claude-code)"; FAILED=$((FAILED+1))
    fi
  done
  say "Project done: $INSTALLED installed, $FAILED failed, $SKIPPED skipped."
  echo "  Superpowers + ECC intentionally stay global (they rely on hooks) — run this script without --project once per machine."
  exit 0
fi

# ---------- global mode ----------
say "Installing the AI stack as Claude Code plugins (global, all projects)"
if ! have claude; then
  bad "Claude Code CLI not found."
  echo "  Install it first:  npm install -g @anthropic-ai/claude-code   (then re-run this script)"
  exit 1
fi

if [ "$UPDATE" = 1 ]; then
  say "Refreshing marketplaces (best effort)"
  for m in claude-plugins-official mattpocock makerskills marketingskills karpathy-skills ui-ux-pro-max-skill ecc superpowers-marketplace; do
    claude plugin marketplace update "$m" >/dev/null 2>&1 || true
  done
  ok "marketplace refresh attempted; reinstall pass will pick up new versions"
fi

for id in $ALL_IDS; do
  if skipped "$id"; then
    warn "skipped: $id"; SKIPPED=$((SKIPPED+1)); continue
  fi
  add_marketplace "$(pack_src "$id")"
  if try_install "$id"; then
    INSTALLED=$((INSTALLED+1))
    [ "$id" = "ecc" ] && install_ecc_rules
  else
    bad "$(pack_label "$id") — install failed (try inside Claude Code: /plugin install $(pack_slugs "$id" | cut -d, -f1))"
    FAILED=$((FAILED+1))
  fi
done

say "MCP layer"
setup_21st_mcp
setup_motion_kit

say "Done: $INSTALLED installed, $FAILED failed, $SKIPPED skipped."
cat <<'EOF'
  Next steps:
    1. Open a NEW Claude Code session (plugins + MCP load at session start).
    2. Verify with /plugin and /mcp, check token overhead with /context.
    3. Once per repo: run /setup-matt-pocock-skills (wires issue tracker + triage labels).
    4. Try the 21st MCP in natural language: "search 21st for an animated pricing table".
    5. If context feels tight, drop the heavy pack:  claude plugin uninstall ecc@ecc

  Re-run this script any time — it is idempotent. Use --update to refresh.
EOF
