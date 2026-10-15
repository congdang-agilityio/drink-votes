import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};
const FLAG = '--env-file-if-exists=.env.local';

const dirs: string[] = [];
afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

function printVar(envFile: string | null, env: NodeJS.ProcessEnv = {}): string {
  const dir = mkdtempSync(join(tmpdir(), 'envfile-'));
  dirs.push(dir);
  if (envFile !== null) writeFileSync(join(dir, '.env.local'), envFile);
  return execFileSync(
    process.execPath,
    [FLAG, '-e', 'console.log(process.env.DV_TEST_PORT ?? "unset")'],
    { cwd: dir, env: { PATH: process.env.PATH, ...env }, encoding: 'utf8' },
  ).trim();
}

describe('.env.local loading', () => {
  it.each(['start', 'migrate'])('npm run %s passes the env-file flag', (name) => {
    expect(pkg.scripts[name]).toContain(FLAG);
  });

  it('reads variables from .env.local', () => {
    expect(printVar('DV_TEST_PORT=4999\n')).toBe('4999');
  });

  it('does not override variables already in the environment', () => {
    expect(printVar('DV_TEST_PORT=4999\n', { DV_TEST_PORT: '1234' })).toBe('1234');
  });

  it('does not fail when .env.local is missing', () => {
    expect(printVar(null)).toBe('unset');
  });

  it('is git-ignored', () => {
    const lines = readFileSync(join(root, '.gitignore'), 'utf8').split('\n');
    expect(lines).toContain('.env.local');
  });
});
