export type Source = 'KEV' | 'NVD' | 'OSV';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type TimeWindow = '1M' | '3M' | '6M';

export interface Vulnerability {
  id: string;
  source: Source;
  title: string;
  description: string;
  severity: Severity;
  cvssScore?: number;
  publishedDate: Date;
  product?: string;
  vendor?: string;
  isExploited?: boolean;
  requiredAction?: string;
  dueDate?: Date;
  url?: string;
  ecosystem?: string;
  ransomwareUse?: boolean;
  threatActors?: import('../lib/threatActors').ThreatActor[];
}

export interface TrendPoint {
  label: string;
  date: Date;
  kev: number;
  nvd: number;
  osv: number;
}

export interface SourceStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  newThisWeek: number;
}
