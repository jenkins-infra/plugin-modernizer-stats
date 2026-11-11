import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const indexHtml = path.join(distDir, 'index.html');
const notFoundHtml = path.join(distDir, '404.html');

try {
  await copyFile(indexHtml, notFoundHtml);
  console.log('[copy-404] dist/404.html created successfully');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error("[ERROR] Required file dist/index.html is missing. Ensure 'vite build' completed successfully.");
  } else {
    console.error(`[ERROR] Failed to copy 404.html: ${err.message}`);
  }

  process.exitCode = 1;
}
