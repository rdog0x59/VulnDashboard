import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'kev.json');

async function main() {
  console.log('Fetching CISA KEV catalog...');
  const res = await fetch(
    'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    { headers: { 'User-Agent': 'VulnDashboard/1.0 (github-pages-build)' } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  mkdirSync(join(__dirname, '..', 'public'), { recursive: true });
  writeFileSync(OUT, text);
  const count = JSON.parse(text).count;
  console.log(`KEV: saved ${count} entries to public/kev.json`);
}

main().catch((err) => {
  console.warn(`Warning: could not fetch KEV data (${err.message}). Build will continue.`);
});
