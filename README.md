# pious-angular-starter

Generic Angular 22 SPA **template**. Spawn a new app from this checkout, or restamp in place.

**Need:** Node `^22.22.3 || ^24.15.0 || >=26.0.0` and npm.

## Spawn

Default: copy into a new folder so this repo stays a usable template.

```bash
npm run create -- --name my-app --site https://example.netlify.app
```

Output defaults to `../my-app`. Then `cd ../my-app`, `npm install`, `npm start`.

`--git` (default on for copy) runs `git init` in the **new** folder only. The script never adds a GitHub remote or pushes.

### Flags

| Flag | Default | Meaning |
|------|---------|---------|
| `--name` | prompt / current folder | kebab-case app name |
| `--site` | `https://example.netlify.app` | public site URL |
| `--out` | `../<name>` | destination folder (copy mode) |
| `--in-place` | off | restamp this checkout; do not copy |
| `--host` | `netlify` | `netlify` keeps `netlify.toml`; `none` skips Netlify ("I'll configure deploy myself") |
| `--supabase` | off | placeholder Supabase client strings (Angular CLI does **not** load `.env`) |
| `--git` | on (copy mode) | `git init` in the new folder only |
| `--no-git` | | skip `git init` |

Copy excludes `node_modules`, `.git`, `dist`, `.angular`, `coverage`, `.env`, and `.env.*`.

### Netlify

Default `--host netlify` keeps `netlify.toml` (publish `dist/<name>/browser`, SPA rewrite `/*` → `/index.html`). In the Netlify dashboard, **Import from GitHub** and select the new repo. Do not add `@netlify/angular-runtime`. This template does not call the Netlify API or store credentials.

`--host none` omits `netlify.toml`. Build is still `dist/<name>/browser`; configure your host's history fallback to `index.html`.

## Run

```bash
npm run check
npm install
npm start
```

Dev server: http://localhost:4200

## In-place

Restamp package name, titles, publish path, and `src/app/core/site.ts` in this checkout (does not rename the folder on disk):

```bash
npm run create -- --in-place --name my-app --site https://example.netlify.app
```

Publish URL: <!-- site-url -->https://example.netlify.app<!-- /site-url -->

## Ship

<!-- ship-block -->
```bash
npm run build
```

In the Netlify dashboard, Import from GitHub and point the site at this repo. `netlify.toml` already sets `publish` to `dist/<name>/browser` and rewrites `/*` to `/index.html` (SPA). Do not add the Netlify Angular SSR plugin. This script does not call the Netlify API or store credentials.
<!-- /ship-block -->

## Layout

- `/` Home
- `/lab` signals / control-flow playground
- anything else → Not found

AI agents: read `AGENTS.md` and install official Angular skills (`npx skills add https://github.com/angular/skills --yes`).

## License

MIT
