import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'docs/index.html');
const mascotPath = resolve(root, 'docs/assets/mascot-nuvetio-infographic.svg');
const cssPath = resolve(root, 'docs/styles.css');

test('la página presenta la mascota virtual actualizada de Nuvetio', async () => {
  const html = await readFile(htmlPath, 'utf8');
  const css = await readFile(cssPath, 'utf8');
  const mascot = await readFile(mascotPath, 'utf8');

  await access(mascotPath);
  assert.match(html, /team-visual-mascot/);
  assert.match(html, /mascot-nuvetio-infographic\.svg/);
  assert.match(html, /mascota virtual/i);
  assert.doesNotMatch(html, /ballena|whale/i);
  assert.match(css, /\.team-visual-mascot__overlay[^}]*width:\s*22%/);
  assert.match(css, /\.team-visual-mascot__overlay\s*\{[^}]*width:\s*28%/s);
  assert.match(mascot, /<text[^>]*>N<\/text>/);
  assert.doesNotMatch(mascot, /M180 260v47M157 283h46/);
});
