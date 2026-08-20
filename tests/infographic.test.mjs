import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'docs/index.html');
const mascotPath = resolve(root, 'docs/assets/mascot-nuvetio.png');
const infographicPath = resolve(root, 'docs/assets/nuvetio-team-infographic.png');

test('la página presenta la mascota virtual actualizada de Nuvetio', async () => {
  const html = await readFile(htmlPath, 'utf8');

  await access(mascotPath);
  await access(infographicPath);
  assert.match(html, /mascot-nuvetio\.png/);
  assert.match(html, /nuvetio-team-infographic\.png/);
  assert.match(html, /mascota (virtual|robot)/i);
  assert.doesNotMatch(html, /ballena|whale/i);
  assert.doesNotMatch(html, /team-visual-mascot__overlay|mascot-nuvetio-infographic\.svg/);
});
