import type { Vulnerability } from '../types';
import { severityFromScore } from './utils';

const OSV_BASE = 'https://api.osv.dev/v1';

type OsvEcosystem =
  | 'npm'
  | 'PyPI'
  | 'Go'
  | 'Maven'
  | 'RubyGems'
  | 'NuGet'
  | 'Hex'
  | 'Packagist'
  | 'crates.io';

interface OsvSeverity {
  type: string;
  score: string;
}

interface OsvVuln {
  id: string;
  summary?: string;
  details?: string;
  published: string;
  modified: string;
  severity?: OsvSeverity[];
  affected?: { package?: { name?: string; ecosystem?: string } }[];
  references?: { url: string }[];
}

interface OsvQueryResponse {
  vulns?: OsvVuln[];
}

function parseCvssScore(score: string): number | undefined {
  // OSV CVSS score strings look like "CVSS:3.1/AV:N/AC:L/..." - extract base score
  // For CVSS 3.x the base score is not directly in the vector string without parsing
  // OSV also provides numeric scores in some entries
  const num = parseFloat(score);
  if (!isNaN(num) && num >= 0 && num <= 10) return num;
  return undefined;
}

function normalizeOSV(v: OsvVuln): Vulnerability {
  const scoreStr = v.severity?.[0]?.score;
  const score = scoreStr ? parseCvssScore(scoreStr) : undefined;
  const pkg = v.affected?.[0]?.package;
  return {
    id: v.id,
    source: 'OSV',
    title: v.summary ?? v.id,
    description: v.details ?? v.summary ?? '',
    severity: severityFromScore(score),
    cvssScore: score,
    publishedDate: new Date(v.published),
    product: pkg?.name,
    vendor: pkg?.ecosystem,
    ecosystem: pkg?.ecosystem,
    url: `https://osv.dev/vulnerability/${v.id}`,
  };
}

export async function searchOSV(
  packageName: string,
  ecosystem: OsvEcosystem
): Promise<Vulnerability[]> {
  const body = JSON.stringify({
    package: { name: packageName, ecosystem },
  });

  const res = await fetch(`${OSV_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) throw new Error(`OSV query failed: ${res.status}`);
  const data: OsvQueryResponse = await res.json();
  return (data.vulns ?? []).map(normalizeOSV);
}

export const OSV_ECOSYSTEMS: OsvEcosystem[] = [
  'npm',
  'PyPI',
  'Go',
  'Maven',
  'RubyGems',
  'NuGet',
  'crates.io',
  'Packagist',
];
