# Agent notes

This is Angular 22, zoneless, standalone, signals, `OnPush`.

Install and obey official skills: `npx skills add https://github.com/angular/skills --yes`

Official refs:

- https://angular.dev
- https://github.com/angular/skills
- https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/

## Spawn vs in-place

This checkout is a **template**. Prefer spawning a new app over restamping the starter.

- Default `npm run create`: copy into `--out` (default `../<name>`), stamp identity there, leave this repo usable as a template. Copy skips `node_modules`, `.git`, `dist`, `.angular`, `coverage`, `.env`, and `.env.*`.
- `--in-place`: restamp this checkout without copy (package name, titles, publish path, `src/app/core/site.ts`, README markers). Does not rename the folder on disk.

`git init` (default yes, ask) runs in the **new** folder only. Never add a GitHub remote or push from the script.

## Generate

Use `npx ng generate`. New components: standalone, `ChangeDetectionStrategy.OnPush`, `inject()` instead of constructor DI, `@if` / `@for` / `@switch`. Prefer `input()` / `input.required()` / `model()` / `httpResource` for GETs (`provideHttpClient()` is already in `app.config.ts`).

Pages live under `src/app/pages/`. Shared identity is `src/app/core/site.ts` (`appName`, `appTitle`, `siteUrl`) — restamp it with `npm run create`, do not hardcode a personal domain.

Landing route is eager; `lab` and `**` are `loadComponent`. Keep the wildcard last. Route `title` values are composed by `AppTitleStrategy`.

## Hosting

Static SPA. Publish dir is `dist/<package-name>/browser` (explicit `outputPath.base` in `angular.json`). Do not flatten `browser` unless you verified the output. Do not add `@netlify/angular-runtime`.

- Default `--host netlify`: keep `netlify.toml` SPA rewrite (`/*` → `/index.html`). Document Netlify dashboard **Import from GitHub** only — no Netlify API or credential scripting.
- `--host none`: remove `netlify.toml` from the spawn. README ship section is static build → `dist/<name>/browser`; the operator wires the host and history fallback to `index.html`.

## Git

Never `git push` or create GitHub remotes unless the human explicitly asks in that session.
