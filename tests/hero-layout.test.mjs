import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('el hero coloca la mascota a la izquierda del mensaje principal', async () => {
  const html = await readFile(resolve(root, 'docs/index.html'), 'utf8');
  const css = await readFile(resolve(root, 'docs/styles.css'), 'utf8');
  await access(resolve(root, 'docs/assets/hero-mascot-nuvetio.png'));

  assert.match(html, /class="hero__content hero-layout"/);
  assert.match(html, /class="hero-mascot"[^>]+src="\.\/assets\/hero-mascot-nuvetio\.png"/);
  assert.match(css, /\.hero-layout\s*\{[^}]*display:\s*grid/);
  assert.match(css, /\.hero-layout\s*\{[^}]*grid-template-columns:\s*minmax\(180px,\s*\.7fr\)\s+minmax\(0,\s*1\.3fr\)/);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.hero-layout\s*\{[^}]*grid-template-columns:\s*1fr/);
});
