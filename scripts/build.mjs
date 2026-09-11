import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

export function validateSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    throw new Error('settings.json must contain a settings object.');
  }
  const keys = ['vdoNinjaUrl', 'vdoNinjaPassword', 'discordInviteUrl', 'discordChannelName'];
  for (const key of keys) {
    if (typeof settings[key] !== 'string' || !settings[key].trim()) {
      throw new Error(`${key} must be nonempty text in quotation marks.`);
    }
  }
  for (const key of Object.keys(settings)) {
    if (!keys.includes(key)) throw new Error(`Unknown setting: ${key}. Check the field name.`);
  }
  for (const key of ['vdoNinjaUrl', 'discordInviteUrl']) {
    const value = settings[key];
    if (value !== value.trim() || /[\s\\]/u.test(value)) {
      throw new Error(`${key} cannot contain spaces or backslashes. Paste the plain URL.`);
    }
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new Error(`${key} must be an HTTPS link without login credentials.`);
    }
    const hosts = key === 'vdoNinjaUrl' ? ['vdo.ninja'] : ['discord.gg', 'discord.com'];
    if (!hosts.includes(url.hostname) || url.port) {
      throw new Error(`${key} must point to ${hosts.join(' or ')}.`);
    }
    if (key === 'discordInviteUrl' && !(url.hostname === 'discord.gg' ? /^\/[A-Za-z0-9-]+\/?$/u : /^\/invite\/[A-Za-z0-9-]+\/?$/u).test(url.pathname)) {
      throw new Error('discordInviteUrl must be a server invite link.');
    }
  }
  return settings;
}

export function renderPage(template, settings) {
  validateSettings(settings);
  const escapeHtml = value => value.replace(/[&<>"']/gu, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  return template.replace(/\{\{(\w+)\}\}/gu, (_, key) => {
    if (!Object.hasOwn(settings, key)) throw new Error(`Unknown template field: ${key}`);
    return escapeHtml(settings[key]);
  });
}

export async function build() {
  const settings = JSON.parse(await readFile(path.join(root, 'settings.json'), 'utf8'));
  const template = await readFile(path.join(root, 'src/index.html'), 'utf8');
  const html = renderPage(template, settings);
  const output = path.join(root, 'dist');
  await mkdir(output, { recursive: true });
  await cp(path.join(root, 'src/assets'), path.join(output, 'assets'), { recursive: true });
  await cp(path.join(root, 'src/styles.css'), path.join(output, 'styles.css'));
  await writeFile(path.join(output, 'index.html'), html);
  await writeFile(path.join(output, '.nojekyll'), '');
  console.log('Built static site in dist/');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch(error => { console.error(`Build failed: ${error.message}`); process.exitCode = 1; });
}
