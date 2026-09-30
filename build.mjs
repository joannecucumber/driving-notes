import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [css, notes, app, map] = await Promise.all([
  read('style.css'), read('notes.js'), read('app.js'), readFile(new URL('map.png', root))
]);
let html = await read('index.html');
html = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>${css}</style>`);
html = html.replace('  <script src="notes.js" defer></script>\n  <script src="app.js" defer></script>', '');
html = html.replace('src="map.png"', () => `src="data:image/png;base64,${map.toString('base64')}"`);
html = html.replace('</body>', () => `<script>${notes}\n${app}</script>\n</body>`);
await writeFile(new URL('考場互動筆記.html', root), html);
console.log('Built offline single-file page: 考場互動筆記.html');
