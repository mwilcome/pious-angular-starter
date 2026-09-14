# pious-angular-starter

Generic Angular 22 SPA you can clone, rename, and publish to Netlify as a static site.

**Need:** Node `^22.22.3 || ^24.15.0 || >=26.0.0` and npm.

## Run

```bash
npm run check
npm install
npm start
```

Dev server: http://localhost:4200

## Rename

This script restamps package name, titles, Netlify publish path, and `src/app/core/site.ts`. It does not rename the folder on disk.

```bash
npm run create -- --name my-app --site https://example.netlify.app
```

Publish URL: <!-- site-url -->https://example.netlify.app<!-- /site-url -->

Optional: `--supabase` adds placeholder client strings (Angular CLI does **not** load `.env`). `--git` runs `git init` only.

## Ship

```bash
npm run build
```

Connect this folder to Netlify. `netlify.toml` already sets `publish` to `dist/<name>/browser` and rewrites `/*` to `/index.html` (SPA). Do not add the Netlify Angular SSR plugin.

## Layout

- `/` Home
- `/lab` signals / control-flow playground
- anything else → Not found

AI agents: read `AGENTS.md` and install official Angular skills (`npx skills add https://github.com/angular/skills --yes`).

## License

MIT
