import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSettings, renderPage } from './build.mjs';

const settings = JSON.parse(await readFile(new URL('../settings.json', import.meta.url), 'utf8'));
const template = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');

test('approved links are present in static HTML with all URL parameters preserved', () => {
  const html = renderPage(template, settings);
  for (const key of ['vdoNinjaUrl', 'discordInviteUrl']) {
    const expected = settings[key].replaceAll('&', '&amp;');
    assert.ok(html.includes(`href="${expected}"`));
  }
  assert.ok(html.includes('Discord account required'));
  assert.ok(html.includes('Password: <strong>'));
  assert.ok(!html.includes('{{'));
  assert.ok(!html.includes('<script'));
});

test('channel text and password are escaped as content, not markup', () => {
  const html = renderPage(template, { ...settings, discordChannelName: '<script>alert("test")</script>', vdoNinjaPassword: '<b>&"' });
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;b&gt;&amp;&quot;'));
  assert.ok(!html.includes('<script>'));
});

test('bad edits fail before publishing', () => {
  for (const change of [
    { discordInviteUrl: 'javascript:alert(1)' },
    { discordInviteUrl: 'https://discord.gg.evil.example/invite' },
    { discordInviteUrl: 'https://discord.com/channels/123/456' },
    { vdoNinjaUrl: 'https://vdo.ninja/?room=test\\&queue' },
    { vdoNinjaPassword: 12345 },
    { discordChannelName: '' },
    { typo: 'unexpected field' },
  ]) assert.throws(() => validateSettings({ ...settings, ...change }));
});

test('all local page assets exist and the bundled fonts are WOFF2 files', async () => {
  const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  const paths = [
    ...[...template.matchAll(/(?:href|src)="\.\/([^"{}]+)"/gu)].map(match => match[1]),
    ...[...css.matchAll(/url\("\.\/([^"{}]+)"\)/gu)].map(match => match[1]),
  ];
  for (const asset of paths) {
    const bytes = await readFile(new URL(`../src/${asset}`, import.meta.url));
    assert.ok(bytes.length > 0, `${asset} must not be empty`);
    if (asset.endsWith('.woff2')) assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
  }
});
