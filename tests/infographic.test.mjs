import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'docs/index.html');
const mascotPath = resolve(root, 'docs/assets/mascot-nuvetio-infographic.svg');

test('la página presenta la mascota virtual actualizada de Nuvetio', async () => {
  const html = await readFile(htmlPath, 'utf8');

  await access(mascotPath);
  assert.match(html, /team-visual-mascot/);
  assert.match(html, /mascot-nuvetio-infographic\.svg/);
  assert.match(html, /mascota virtual/i);
  assert.doesNotMatch(html, /ballena|whale/i);
});
