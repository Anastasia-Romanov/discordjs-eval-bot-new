// eslint-disable-next-line @typescript-eslint/no-require-imports
import coImport = require('./co');
import { stripIndent } from 'common-tags';
import * as Discord from 'discord.js';
import * as assert from 'node:assert/strict';
import * as child_process from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export function $(process: string, ...args: string[]) {
  const child = child_process.spawn(process, args);
  return new Promise((resolve, reject) => {
    let res = '';

    child.stdout.on('data', (data) => {
      res += data;
    });

    child.stderr.on('data', (data) => {
      res += data;
    });

    child.on('close', (code) => {
      if (code === 0) resolve(res);
      else reject(res);
    });
  });
}

$.obj = function (
  process: string,
  ...args: string[]
): Promise<Record<'stdout' | 'stderr', string>> {
  const child = child_process.spawn(process, args);
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data;
    });

    child.stderr.on('data', (data) => {
      stderr += data;
    });

    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject({ stdout, stderr });
    });
  });
};

export function runCommand(command: string) {
  return $('bash', '-c', command);
}

export const runCommandSync = child_process.execSync;

export function install(packageName: string, version?: string) {
  const name = version ? `${packageName}@${version}` : packageName;
  return $('pnpm', 'add', name);
}

export async function registerCommand(
  name: string,
  run: (
    message: Discord.Message,
    args: string[],
    helpers: unknown // typeof helpers
  ) => void
) {
  assert.ok(typeof name === 'string');
  assert.ok(typeof run === 'function');
  assert.ok(name.indexOf('.') === -1);
  assert.ok(name.indexOf(path.sep) === -1);

  await fs.writeFile(
    `./commands/${name}.js`,
    stripIndent`
      const Discord = require('discord.js');

      module.exports = ${String(run)}
    `
  );
  Reflect.deleteProperty(require.cache, require.resolve(`./commands/${name}`));

  return true;
}
export async function deleteCommand(name: string) {
  assert.ok(typeof name === 'string');
  assert.ok(name.indexOf('.') === -1);
  assert.ok(name.indexOf(path.sep) === -1);
  await fs.unlink(`./commands/${name}.js`);
  return true;
}

export function truncate(str: string, maxLength: number) {
  assert.ok(typeof str === 'string');
  assert.ok(typeof maxLength === 'number');
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

export async function fileExists(file: string) {
  assert.ok(typeof file === 'string');
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export const co = coImport;
