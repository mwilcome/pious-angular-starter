# Agent notes

This is Angular 22, zoneless, standalone, signals, `OnPush`.

Install and obey official skills: `npx skills add https://github.com/angular/skills --yes`

Official refs:

- https://angular.dev
- https://github.com/angular/skills
- https://docs.netlify.com/build/frameworks/framework-setup-guides/angular/

## Generate

Use `npx ng generate`. New components: standalone, `ChangeDetectionStrategy.OnPush`, `inject()` instead of constructor DI, `@if` / `@for` / `@switch`. Prefer `input()` / `input.required()` / `model()` / `httpResource` for GETs (`provideHttpClient()` is already in `app.config.ts`).

Pages live under `src/app/pages/`. Shared identity is `src/app/core/site.ts` (`appName`, `appTitle`, `siteUrl`) — restamp it with `npm run create`, do not hardcode a personal domain.

Landing route is eager; `lab` and `**` are `loadComponent`. Keep the wildcard last. Route `title` values are composed by `AppTitleStrategy`.

## Hosting

Static SPA. Publish dir is `dist/<package-name>/browser` (explicit `outputPath.base` in `angular.json`). Do not flatten `browser` unless you verified the output. Do not add `@netlify/angular-runtime`.

## Git

Never `git push` or create GitHub remotes unless the human explicitly asks in that session.
