# scripts/engine-env.sh — load secrets into the shell for the .engine pipeline.
#
# WHY: the content engine's Python (serp-research, image gen) reads os.environ
# DIRECTLY — it does NOT auto-read .env.local the way Next.js does. So the keys
# must live in the shell environment. This script puts them there, and maps the
# DataForSEO creds to the variable names the engine expects.
#
# USAGE — source it (don't execute), once per terminal session:
#     source scripts/engine-env.sh
#
# ...or inline, for a single command:
#     source scripts/engine-env.sh && \
#       .venv/bin/python .engine/skills/serp-research/scripts/pull_brief.py --keyword "..." ...
#
# Reads .env.local by default; pass another file as the first arg.

_ssenv_file="${1:-.env.local}"

if [ ! -f "$_ssenv_file" ]; then
  echo "engine-env: $_ssenv_file not found (run from the repo root)" >&2
else
  # Parse KEY=value literally — no `source`, so values are never shell-evaluated
  # (a password with $ or backticks can't run code).
  while IFS= read -r _line || [ -n "$_line" ]; do
    case "$_line" in
      ''|\#*) continue ;;            # skip blanks + comment lines
    esac
    _key=${_line%%=*}
    _val=${_line#*=}
    _key=${_key#export }             # tolerate `export KEY=...`
    _key=$(printf '%s' "$_key" | tr -d '[:space:]')
    case "$_val" in                  # strip one layer of matching quotes
      \"*\") _val=${_val#\"}; _val=${_val%\"} ;;
      \'*\') _val=${_val#\'}; _val=${_val%\'} ;;
    esac
    [ -n "$_key" ] && export "$_key=$_val"
  done < "$_ssenv_file"
fi

# The engine reads DATAFORSEO_LOGIN; you named yours DATAFORSEO_USERNAME. Map it.
if [ -z "${DATAFORSEO_LOGIN:-}" ] && [ -n "${DATAFORSEO_USERNAME:-}" ]; then
  export DATAFORSEO_LOGIN="$DATAFORSEO_USERNAME"
fi

# Redacted confirmation (names only, never values).
for _v in OPENAI_API_KEY DATAFORSEO_LOGIN DATAFORSEO_PASSWORD; do
  eval "_set=\${$_v:-}"
  if [ -n "$_set" ]; then echo "engine-env: OK  $_v"; else echo "engine-env: --  $_v MISSING"; fi
done
unset _ssenv_file _line _key _val _v _set
