#!/usr/bin/env node
/**
 * Scaffold a new project: copy the _template folder, fill in its meta, and
 * register it. Usage:  npm run new-project <slug>     (slug = kebab-case)
 *
 * Creates src/projects/<slug>/index.ts and wires it into registry.ts at the
 * marker comments. The new project shows in the switcher with an empty tab bar;
 * add sections to its index.ts (see src/projects/yc-itsm/) to light up views.
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = join(root, 'src', 'projects');

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run new-project <slug>   (e.g. npm run new-project acme-portal)');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error(`Invalid slug "${slug}". Use kebab-case: lowercase letters, digits, hyphens; start with a letter.`);
  process.exit(1);
}

const exists = async (p) => access(p).then(() => true).catch(() => false);

const destDir = join(projectsDir, slug);
if (await exists(destDir)) {
  console.error(`Project already exists: src/projects/${slug}/`);
  process.exit(1);
}

const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const ident = slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, '');

// 1. Write src/projects/<slug>/index.ts from the template.
const template = await readFile(join(projectsDir, '_template', 'index.ts'), 'utf8');
const filled = template.replaceAll('__SLUG__', slug).replaceAll('__NAME__', name);
await mkdir(destDir, { recursive: true });
await writeFile(join(destDir, 'index.ts'), filled, 'utf8');

// 2. Register it in registry.ts at the marker comments.
const registryPath = join(projectsDir, 'registry.ts');
let registry = await readFile(registryPath, 'utf8');
const importMarker = '/* new-project:imports */';
const entryMarker = '/* new-project:entries */';
if (!registry.includes(importMarker) || !registry.includes(entryMarker)) {
  console.error('registry.ts is missing the new-project marker comments; add it manually.');
  process.exit(1);
}
registry = registry.replace(importMarker, `import ${ident} from './${slug}';\n${importMarker}`);
registry = registry.replace(entryMarker, `'${slug}': ${ident},\n  ${entryMarker}`);
await writeFile(registryPath, registry, 'utf8');

console.log(`✓ Created src/projects/${slug}/index.ts and registered it.

Next:
  1. Author data files in src/projects/${slug}/ and add their sections to index.ts
     (copy patterns from src/projects/yc-itsm/).
  2. npm run build   to typecheck.
  3. Open the app — "${name}" is in the project switcher (top-right).`);
