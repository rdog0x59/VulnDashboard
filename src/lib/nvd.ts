import { format } from 'date-fns';
import { cacheGet, cacheSet } from './cache';
import { severityFromScore, sleep, generateBuckets, windowStartDate } from './utils';
import type { Vulnerability, TimeWindow } from '../types';

const NVD_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const NVD_DATE_FMT = "yyyy-MM-dd'T'HH:mm:ss.SSS";
const RECENT_CACHE_KEY = 'nvd-recent';
const COUNTS_CACHE_KEY = (w: TimeWindow) => `nvd-counts-${w}`;
const RECENT_TTL = 2 * 60 * 60 * 1000; // 2 hours
const COUNTS_TTL = 4 * 60 * 60 * 1000; // 4 hours

interface NVDMetric {
  cvssData: { baseScore: number; baseSeverity: string };
}

interface NVDCve {
  id: string;
  published: string;
  lastModified: string;
  descriptions: { lang: string; value: string }[];
  metrics?: {
    cvssMetricV31?: NVDMetric[];
    cvssMetricV30?: NVDMetric[];
    cvssMetricV2?: NVDMetric[];
  };
  references?: { url: string }[];
}

interface NVDResponse {
  totalResults: number;
  vulnerabilities: { cve: NVDCve }[];
}

function formatNVDDate(d: Date): string {
  return format(d, NVD_DATE_FMT);
}

function extractMetric(cve: NVDCve): NVDMetric | undefined {
  return (
    cve.metrics?.cvssMetricV31?.[0] ??
    cve.metrics?.cvssMetricV30?.[0] ??
    cve.metrics?.cvssMetricV2?.[0]
  );
}

function normalizeNVDEntry(cve: NVDCve): Vulnerability {
  const metric = extractMetric(cve);
  const score = metric?.cvssData.baseScore;
  const desc = cve.descriptions.find((d) => d.lang === 'en')?.value ?? '';
  return {
    id: cve.id,
    source: 'NVD',
    title: cve.id,
    description: desc,
    severity: severityFromScore(score),
    cvssScore: score,
    publishedDate: new Date(cve.published),
    lastModifiedDate: new Date(cve.lastModified),
    url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
  };
}

export async function fetchNVDRecent(count = 50): Promise<Vulnerability[]> {
  const cached = cacheGet<Vulnerability[]>(RECENT_CACHE_KEY);
  if (cached) return cached;

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);

  const url =
    `${NVD_BASE}?pubStartDate=${formatNVDDate(start)}&pubEndDate=${formatNVDDate(now)}` +
    `&resultsPerPage=${count}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`NVD fetch failed: ${res.status}`);
  const data: NVDResponse = await res.json();
  const vulns = data.vulnerabilities.map((v) => normalizeNVDEntry(v.cve));

  cacheSet(RECENT_CACHE_KEY, vulns, RECENT_TTL);
  return vulns;
}

/** Returns per-bucket CVE counts for the trend chart, using lightweight totalResults queries. */
export async function fetchNVDTrendCounts(window: TimeWindow): Promise<number[]> {
  const cacheKey = COUNTS_CACHE_KEY(window);
  const cached = cacheGet<number[]>(cacheKey);
  if (cached) return cached;

  const buckets = generateBuckets(window);
  const counts: number[] = [];

  for (let i = 0; i < buckets.length; i++) {
    if (i > 0) await sleep(600); // stay under the 5 req/30s rate limit
    const { start, end } = buckets[i];
    const url =
      `${NVD_BASE}?pubStartDate=${formatNVDDate(start)}&pubEndDate=${formatNVDDate(end)}` +
      `&resultsPerPage=1`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`${res.status}`);
      const data: NVDResponse = await res.json();
      counts.push(data.totalResults);
    } catch {
      counts.push(0);
    }
  }

  cacheSet(cacheKey, counts, COUNTS_TTL);
  return counts;
}

// NVD API rejects date ranges > 120 days — split into safe 90-day chunks.
const NVD_CHUNK_DAYS = 90;

function dateChunks(start: Date, end: Date): { start: Date; end: Date }[] {
  const chunks: { start: Date; end: Date }[] = [];
  let cursor = new Date(start);
  while (cursor < end) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setDate(chunkEnd.getDate() + NVD_CHUNK_DAYS);
    chunks.push({ start: new Date(cursor), end: chunkEnd > end ? new Date(end) : chunkEnd });
    cursor = new Date(chunkEnd);
    cursor.setDate(cursor.getDate() + 1);
  }
  return chunks;
}

/** Fetch NVD entries for the catalog, chunking date range to respect the 120-day API limit. */
export async function fetchNVDForWindow(window: TimeWindow): Promise<Vulnerability[]> {
  const cacheKey = `nvd-window-${window}`;
  const cached = cacheGet<Vulnerability[]>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const chunks = dateChunks(windowStartDate(window), now);
  const seen = new Set<string>();
  const all: Vulnerability[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await sleep(700); // respect 5 req/30s rate limit
    const { start, end } = chunks[i];
    const url =
      `${NVD_BASE}?pubStartDate=${formatNVDDate(start)}&pubEndDate=${formatNVDDate(end)}` +
      `&resultsPerPage=2000&noRejected`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`NVD ${res.status}`);
      const data: NVDResponse = await res.json();
      for (const { cve } of data.vulnerabilities) {
        if (!seen.has(cve.id)) { seen.add(cve.id); all.push(normalizeNVDEntry(cve)); }
      }
    } catch {
      // continue with partial data from other chunks
    }
  }

  cacheSet(cacheKey, all, COUNTS_TTL);
  return all;
}
