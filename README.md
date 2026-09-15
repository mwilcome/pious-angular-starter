# pious-angular-starter

Angular 22 SPA template. Spawn a new app from this checkout, or restamp in place.

Needs Node `^22.22.3 || ^24.15.0 || >=26.0.0` and npm.

## Humans

After you clone, run the spawn script. It copies the template into a **new folder** so this checkout stays a template, then asks a few questions.

**macOS / Linux**

```bash
./scripts/spawn.sh
```

**Windows**

```bat
scripts\spawn.ps1
```

or `scripts\spawn.cmd`. If those are a pain, `npm run create` asks the same things in Node.

It asks:

1. **App name** (kebab-case) — package.json name, angular.json project + `outputPath`, titles, default folder name
2. **Destination folder** — where the copy lands (default `../<name>`); this checkout is left alone
3. **Site URL** — optional placeholder in `site.ts`, README, and netlify comments
4. **Netlify vs configure-myself** — keep or drop `netlify.toml` and the README ship block
5. **Supabase** — y/N (default N); optional stub files / dependency
6. **git init** — y/N (default Y); `git init` in the **new** folder only (no remote, no push)

Then `cd` into the new folder, `npm install`, `npm start`.

## AI

Non-interactive flags. Same engine: copy → stamp → optional git.

```bash
npm run create -- --name my-app --dest ../my-app --site https://example.netlify.app --host netlify --no-git
```

`--dest` and `--out` are the same flag. `--in-place` restamps this checkout; no copy.

| Flag | Default | Meaning |
|------|---------|---------|
| `--name` | prompt / current folder | kebab-case app name |
| `--site` | `https://example.netlify.app` | public site URL |
| `--dest` (`--out`) | `../<name>` | destination folder (copy mode) |
| `--in-place` | off | restamp this checkout; do not copy |
| `--host` | `netlify` | `netlify` keeps `netlify.toml`; `none` skips Netlify |
| `--supabase` | off | placeholder Supabase client strings (Angular CLI does **not** load `.env`) |
| `--git` | on (copy mode) | `git init` in the new folder only |
| `--no-git` | | skip `git init` |

Copy skips `node_modules`, `.git`, `dist`, `.angular`, `coverage`, `.env`, and `.env.*`.

### Netlify

Default `--host netlify` keeps `netlify.toml` (publish `dist/<name>/browser`, SPA rewrite `/*` → `/index.html`). In the Netlify dashboard, **Import from GitHub** and pick the new repo. Don't add `@netlify/angular-runtime`. This doesn't call the Netlify API or store credentials.

`--host none` drops `netlify.toml`. Build is still `dist/<name>/browser`; set your host's history fallback to `index.html`.

## Run

```bash
npm run check
npm install
npm start
```

Dev server: http://localhost:4200

## In-place

Restamp package name, titles, publish path, and `src/app/core/site.ts` in this checkout. Doesn't rename the folder:

```bash
npm run create -- --in-place --name my-app --site https://example.netlify.app
```

Publish URL: <!-- site-url -->https://example.netlify.app<!-- /site-url -->

## Ship

<!-- ship-block -->
```bash
npm run build
```

In Netlify: Import from GitHub and point the site at this repo. `netlify.toml` already publishes `dist/<name>/browser` and rewrites `/*` to `/index.html`. Don't add the Netlify Angular SSR plugin. Doesn't log into Netlify or store credentials.
<!-- /ship-block -->

## Layout

- `/` Home
- `/lab` signals / control-flow scratch page
- anything else → Not found

AI agents: read `AGENTS.md` and install official Angular skills (`npx skills add https://github.com/angular/skills --yes`).

## License

MIT
