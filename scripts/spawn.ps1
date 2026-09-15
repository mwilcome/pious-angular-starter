# Human front door (Windows): explained questions, then the same engine as npm run create.
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
if (-not $Root) {
  $Root = Split-Path -Parent $MyInvocation.MyCommand.Path
  $Root = Split-Path -Parent $Root
}
Set-Location $Root

if ($args.Count -gt 0) {
  & node (Join-Path $Root 'scripts/create.mjs') @args
  exit $LASTEXITCODE
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Need Node.js to spawn an app. Install from https://nodejs.org (see README engines)."
}

function Read-Value([string]$Prompt, [string]$Default = $null) {
  $suffix = if ($null -ne $Default -and $Default -ne '') { " [$Default]" } else { '' }
  $reply = Read-Host "$Prompt$suffix"
  if ([string]::IsNullOrWhiteSpace($reply)) {
    return $Default
  }
  return $reply.Trim()
}

function Read-YesNo([string]$Prompt, [bool]$DefaultYes) {
  $hint = if ($DefaultYes) { 'Y/n' } else { 'y/N' }
  $fallback = if ($DefaultYes) { 'Y' } else { 'N' }
  $reply = Read-Value "$Prompt ($hint)" $fallback
  switch -Regex ($reply) {
    '^(?i)n(o)?$' { return $false }
    '^(?i)y(es)?$' { return $true }
    default { return $DefaultYes }
  }
}

function Convert-Host([string]$Raw) {
  switch -Regex ($Raw.Trim()) {
    '^(?i)(netlify|y|yes)$' { return 'netlify' }
    '^(?i)(none|skip|n|no)$' { return 'none' }
    default { throw 'Please answer netlify or none.' }
  }
}

Write-Host 'Spawn a new Angular app from this template. This checkout stays put.'

$name = $null
while (-not $name) {
  Write-Host @'

App name (kebab-case)
This becomes the npm package name in package.json, the Angular project name and
output folder (dist/<name>/browser) in angular.json, the browser tab title,
src/app/core/site.ts, README heading, and LICENSE copyright line. It also
suggests the default destination folder. Use lowercase letters, digits, and
hyphens only - for example garden-tracker - not spaces or underscores.

'@
  $candidate = Read-Value 'App name (kebab-case)'
  if ($candidate -match '^[a-z0-9]+(-[a-z0-9]+)*$') {
    $name = $candidate
  }
  else {
    Write-Host 'That name is not kebab-case. Example: garden-tracker' -ForegroundColor Yellow
  }
}

$defaultDest = Join-Path '..' $name
$dest = $null
while (-not $dest) {
  Write-Host @"

Destination folder
This template is COPIED into a new folder so this checkout stays reusable.
Default is a sibling folder $defaultDest. The copy skips node_modules, .git,
dist, .angular, coverage, and secret .env files. Do not choose this template
folder itself (use --in-place only if you mean to restamp this checkout).

"@
  $candidate = Read-Value 'Destination folder' $defaultDest
  $destAbs = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($candidate)
  $rootAbs = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Root)
  if ($destAbs -eq $rootAbs) {
    Write-Host 'Destination is the template root. Pick another folder.' -ForegroundColor Yellow
    continue
  }
  $dest = $candidate
}

Write-Host @'

Site URL (optional placeholder)
Written into src/app/core/site.ts, the README site-url marker, and (if you keep
Netlify) a comment in netlify.toml. You can change it later. Leave blank to use
https://example.netlify.app.

'@
$site = Read-Value 'Public site URL' 'https://example.netlify.app'

$hostChoice = $null
while (-not $hostChoice) {
  Write-Host @"

Hosting: Netlify vs configure-myself
  netlify  Keep netlify.toml. Static build publishes dist/$name/browser and
           unknown routes serve index.html (SPA). Later, in the Netlify
           dashboard, Import from GitHub - this script never logs in or stores
           Netlify credentials.
  none     Remove netlify.toml ("I'll configure deploy myself"). README will
           tell you to host dist/$name/browser and set history fallback so
           unknown paths serve index.html.

"@
  try {
    $hostChoice = Convert-Host (Read-Value "Host (netlify, or none = I'll configure deploy myself)" 'netlify')
  }
  catch {
    Write-Host $_ -ForegroundColor Yellow
  }
}

Write-Host @'

Supabase (optional)
Adds placeholder URL/anon-key files and the @supabase/supabase-js package.
Angular CLI does not load .env for you. Default is No - skip unless you already
plan to wire a Supabase client.

'@
$createArgs = @(
  '--name', $name,
  '--dest', $dest,
  '--site', $site,
  '--host', $hostChoice
)
if (Read-YesNo 'Enable Supabase stub?' $false) {
  $createArgs += '--supabase'
}

Write-Host @'

git init (new folder only)
Runs git init -b main in the NEW folder. It does not add a GitHub remote, does
not push, and does not touch git in this template checkout. Default is Yes.

'@
if (Read-YesNo 'git init in the new folder?' $true) {
  $createArgs += '--git'
}
else {
  $createArgs += '--no-git'
}

Write-Host ""
Write-Host "Copying template -> $dest and stamping name=$name host=$hostChoice"
& node (Join-Path $Root 'scripts/create.mjs') @createArgs
exit $LASTEXITCODE
