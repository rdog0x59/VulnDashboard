import { cacheGet, cacheSet } from './cache';
import { severityFromScore } from './utils';
import type { Vulnerability } from '../types';

const KEV_TTL = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_KEY = 'kev-catalog';

interface RawKEVEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes: string;
}

interface KEVCatalog {
  vulnerabilities: RawKEVEntry[];
}

export async function fetchKEV(): Promise<Vulnerability[]> {
  const cached = cacheGet<Vulnerability[]>(CACHE_KEY);
  if (cached) return cached;

  // In production the KEV catalog is fetched at build time and bundled as a static file.
  // In dev the Vite proxy handles the cross-origin request.
  const url = import.meta.env.DEV
    ? '/cisa-kev'
    : `${import.meta.env.BASE_URL}kev.json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`KEV fetch failed: ${res.status}`);
  const catalog: KEVCatalog = await res.json();

  const vulns: Vulnerability[] = catalog.vulnerabilities.map((e) => ({
    id: e.cveID,
    source: 'KEV' as const,
    title: e.vulnerabilityName,
    description: e.shortDescription,
    severity: severityFromScore(undefined), // KEV doesn't include CVSS; mark as UNKNOWN unless enriched
    publishedDate: new Date(e.dateAdded),
    product: e.product,
    vendor: e.vendorProject,
    isExploited: true,
    requiredAction: e.requiredAction,
    dueDate: e.dueDate ? new Date(e.dueDate) : undefined,
    url: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog`,
    ransomwareUse: e.knownRansomwareCampaignUse === 'Known',
  }));

  cacheSet(CACHE_KEY, vulns, KEV_TTL);
  return vulns;
}
