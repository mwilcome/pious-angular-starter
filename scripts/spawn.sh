#!/usr/bin/env bash
# Human front door: explained questions, then the same engine as npm run create.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ $# -gt 0 ]]; then
  exec node "$ROOT/scripts/create.mjs" "$@"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Need Node.js to spawn an app. Install from https://nodejs.org (see README engines)." >&2
  exit 1
fi

NAME_RE='^[a-z0-9]+(-[a-z0-9]+)*$'

ask() {
  local prompt="$1"
  local default="${2-}"
  local reply=""
  if [[ -n "$default" ]]; then
    read -r -p "${prompt} [${default}]: " reply || true
    printf '%s' "${reply:-$default}"
  else
    read -r -p "${prompt}: " reply || true
    printf '%s' "$reply"
  fi
}

lower() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]'
}

ask_yes_no() {
  local prompt="$1"
  local default_yes="$2"
  local hint fallback reply lc
  if [[ "$default_yes" == "1" ]]; then
    hint="Y/n"
    fallback="Y"
  else
    hint="y/N"
    fallback="N"
  fi
  reply="$(ask "${prompt} (${hint})" "$fallback")"
  lc="$(lower "$reply")"
  case "$lc" in
    n|no) return 1 ;;
    y|yes) return 0 ;;
    *)
      if [[ "$default_yes" == "1" ]]; then
        return 0
      fi
      return 1
      ;;
  esac
}

normalize_host() {
  local lc
  lc="$(lower "$1")"
  case "$lc" in
    netlify|y|yes) printf 'netlify' ;;
    none|skip|n|no) printf 'none' ;;
    *)
      echo "Please answer netlify or none." >&2
      return 1
      ;;
  esac
}

echo "Spawn a new Angular app from this template. This checkout stays put."

name=""
while true; do
  cat <<'EOF'

App name (kebab-case)
This becomes the npm package name in package.json, the Angular project name and
output folder (dist/<name>/browser) in angular.json, the browser tab title,
src/app/core/site.ts, README heading, and LICENSE copyright line. It also
suggests the default destination folder. Use lowercase letters, digits, and
hyphens only — for example garden-tracker — not spaces or underscores.

EOF
  name="$(ask "App name (kebab-case)")"
  if [[ "$name" =~ $NAME_RE ]]; then
    break
  fi
  echo "That name is not kebab-case. Example: garden-tracker" >&2
done

default_dest="../${name}"
while true; do
  cat <<EOF

Destination folder
This template is COPIED into a new folder so this checkout stays reusable.
Default is a sibling folder ${default_dest}. The copy skips node_modules, .git,
dist, .angular, coverage, and secret .env files. Do not choose this template
folder itself (use --in-place only if you mean to restamp this checkout).

EOF
  dest="$(ask "Destination folder" "$default_dest")"
  dest_abs="$(node -e 'console.log(require("node:path").resolve(process.argv[1], process.argv[2]))' "$ROOT" "$dest")"
  if [[ "$dest_abs" == "$ROOT" ]]; then
    echo "Destination is the template root. Pick another folder." >&2
    continue
  fi
  break
done

cat <<'EOF'

Site URL (optional placeholder)
Written into src/app/core/site.ts, the README site-url marker, and (if you keep
Netlify) a comment in netlify.toml. You can change it later. Leave blank to use
https://example.netlify.app.

EOF
site="$(ask "Public site URL" "https://example.netlify.app")"

host=""
while true; do
  cat <<EOF

Hosting: Netlify vs configure-myself
  netlify  Keep netlify.toml. Static build publishes dist/${name}/browser and
           unknown routes serve index.html (SPA). Later, in the Netlify
           dashboard, Import from GitHub — this script never logs in or stores
           Netlify credentials.
  none     Remove netlify.toml ("I'll configure deploy myself"). README will
           tell you to host dist/${name}/browser and set history fallback so
           unknown paths serve index.html.

EOF
  host_raw="$(ask "Host (netlify, or none = I'll configure deploy myself)" "netlify")"
  if host="$(normalize_host "$host_raw")"; then
    break
  fi
done

cat <<'EOF'

Supabase (optional)
Adds placeholder URL/anon-key files and the @supabase/supabase-js package.
Angular CLI does not load .env for you. Default is No — skip unless you already
plan to wire a Supabase client.

EOF
supabase_args=()
if ask_yes_no "Enable Supabase stub?" 0; then
  supabase_args=(--supabase)
fi

cat <<'EOF'

git init (new folder only)
Runs git init -b main in the NEW folder. It does not add a GitHub remote, does
not push, and does not touch git in this template checkout. Default is Yes.

EOF
git_args=(--git)
if ! ask_yes_no "git init in the new folder?" 1; then
  git_args=(--no-git)
fi

echo
echo "Copying template → ${dest} and stamping name=${name} host=${host}"
args=(--name "$name" --dest "$dest" --site "$site" --host "$host")
if [[ ${#supabase_args[@]} -gt 0 ]]; then
  args+=("${supabase_args[@]}")
fi
args+=("${git_args[@]}")
exec node "$ROOT/scripts/create.mjs" "${args[@]}"
