import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./', import.meta.url));
for (const name of await readdir(root, { recursive: true })) {
  if (name.endsWith('.mjs')) execFileSync(process.execPath, ['--check', join(root, name)], { stdio: 'inherit' });
}
console.log('✓ Cú pháp JavaScript của bản viết lại');
