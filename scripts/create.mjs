#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { runNpm } from './lib/run-npm.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SITE_TS = 'src/app/core/site.ts';
const SUPABASE_TS = 'src/app/core/supabase.ts';

function read(rel) {
  return readFileSync(path.join(root, rel), 'utf8');
}

function write(rel, contents) {
  writeFileSync(path.join(root, rel), contents);
}

function quote(value) {
  return `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function kebabToTitle(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function currentFolderName() {
  return path.basename(root);
}

function currentPackageName() {
  try {
    return JSON.parse(read('package.json')).name || currentFolderName();
  } catch {
    return currentFolderName();
  }
}

function angularProjectName(pkgName) {
  try {
    const json = JSON.parse(read('angular.json'));
    const names = Object.keys(json.projects ?? {});
    if (names.includes(pkgName)) return pkgName;
    return names[0] ?? pkgName;
  } catch {
    return pkgName;
  }
}

function validateName(name) {
  if (!NAME_RE.test(name)) {
    throw new Error(`Invalid --name "${name}". Use kebab-case (e.g. my-app).`);
  }
}

function validateSite(site) {
  let url;
  try {
    url = new URL(site);
  } catch {
    throw new Error(`Invalid --site "${site}". Use an http(s) URL.`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Invalid --site "${site}". Use an http(s) URL.`);
  }
}

async function prompt(question, fallback) {
  if (!input.isTTY) return fallback;
  const rl = createInterface({ input, output });
  const answer = await rl.question(`${question} [${fallback}]: `);
  rl.close();
  return answer.trim() || fallback;
}

async function promptYesNo(question) {
  const answer = await prompt(`${question} (y/N)`, 'N');
  return /^y(es)?$/i.test(answer);
}

function restampPackageJson(name) {
  const pkg = JSON.parse(read('package.json'));
  pkg.name = name;
  pkg.description ??= 'Generic Angular 22 SPA starter for Netlify.';
  pkg.license ??= 'MIT';
  write('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
}

function restampNetlify(name, site) {
  write(
    'netlify.toml',
    `# Site URL (placeholder): ${site}
[build]
  command = "npm run build"
  publish = "dist/${name}/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`,
  );
}

function restampIndexTitle(appTitle) {
  const html = read('src/index.html').replace(/<title>[^<]*<\/title>/, `<title>${appTitle}</title>`);
  write('src/index.html', html);
}

function restampAngularJson(oldName, newName) {
  const json = JSON.parse(read('angular.json'));
  if (json.projects?.[oldName] && oldName !== newName) {
    json.projects[newName] = json.projects[oldName];
    delete json.projects[oldName];
  }

  const project = json.projects?.[newName] ?? json.projects?.[oldName];
  if (!project) {
    throw new Error('angular.json has no application project to restamp.');
  }

  const buildOptions = project.architect?.build?.options;
  if (buildOptions) {
    buildOptions.outputPath = { base: `dist/${newName}` };
  }

  const walk = (value) => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.buildTarget === 'string') {
      value.buildTarget = value.buildTarget.replaceAll(oldName, newName);
    }
    for (const child of Object.values(value)) walk(child);
  };
  walk(project);

  write('angular.json', `${JSON.stringify(json, null, 2)}\n`);
}

function restampReadme(newName, site) {
  let md = read('README.md');
  md = md.replace(/^# .+$/m, `# ${newName}`);
  md = md.replace(
    /<!-- site-url -->[\s\S]*?<!-- \/site-url -->/,
    `<!-- site-url -->${site}<!-- /site-url -->`,
  );
  write('README.md', md);
}

function restampSite(name, appTitle, site) {
  write(
    SITE_TS,
    `/** Public identity. Restamped by \`npm run create\`. */
export const appName = ${quote(name)};
export const appTitle = ${quote(appTitle)};
export const siteUrl = ${quote(site)};
`,
  );
}

function restampLicense(name) {
  if (!existsSync(path.join(root, 'LICENSE'))) return;
  const year = new Date().getFullYear();
  const license = read('LICENSE').replace(
    /Copyright \(c\) \d+ .+ contributors/,
    `Copyright (c) ${year} ${name} contributors`,
  );
  write('LICENSE', license);
}

function enableSupabase() {
  const install = runNpm(['install', '@supabase/supabase-js'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (install.status !== 0) {
    throw new Error('Failed to add @supabase/supabase-js.');
  }

  write(
    SUPABASE_TS,
    `/** Placeholder strings only. Angular CLI does not auto-load .env; wire a client later. */
export const supabaseUrl = 'https://YOUR_PROJECT.supabase.co';
export const supabaseAnonKey = 'YOUR_ANON_KEY';
`,
  );
  write('.env.example', `NG_APP_SUPABASE_URL=\nNG_APP_SUPABASE_ANON_KEY=\n`);
  console.log('Supabase stub added (placeholders only; .env is not auto-loaded).');
}

function gitInit() {
  if (existsSync(path.join(root, '.git'))) {
    console.log('git already initialized.');
    return;
  }
  const result = spawnSync('git', ['init'], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error('git init failed.');
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: 'string' },
      site: { type: 'string' },
      supabase: { type: 'boolean' },
      git: { type: 'boolean' },
    },
    allowPositionals: false,
  });

  const oldName = angularProjectName(currentPackageName());
  const name = values.name ?? (await prompt('App name (kebab-case)', currentFolderName()));
  const site = values.site ?? (await prompt('Public site URL', 'https://example.netlify.app'));
  const supabase =
    values.supabase ?? (input.isTTY ? await promptYesNo('Enable Supabase stub?') : false);
  const git = values.git ?? (input.isTTY ? await promptYesNo('git init?') : false);

  validateName(name);
  validateSite(site);
  const appTitle = kebabToTitle(name);

  restampPackageJson(name);
  restampNetlify(name, site);
  restampIndexTitle(appTitle);
  restampAngularJson(oldName, name);
  restampReadme(name, site);
  restampSite(name, appTitle, site);
  restampLicense(name);

  if (supabase) enableSupabase();
  if (git) gitInit();

  console.log(`Stamped name=${name} title=${appTitle} site=${site} supabase=${supabase ? 'on' : 'off'} git=${git ? 'yes' : 'no'}`);
  if (currentFolderName() !== name) {
    console.log(`Folder is still "${currentFolderName()}". Rename it on disk if you want it to match --name.`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
