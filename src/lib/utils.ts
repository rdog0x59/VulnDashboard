import {
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  addDays,
  format,
  isAfter,
  isBefore,
} from 'date-fns';
import type { Severity, TimeWindow, TrendPoint, ChartAnnotation } from '../types';

export function severityFromScore(score: number | undefined): Severity {
  if (score === undefined) return 'UNKNOWN';
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  return 'LOW';
}

export function windowStartDate(window: TimeWindow): Date {
  const now = new Date();
  const months = window === '3M' ? 3 : window === '6M' ? 6 : 12;
  return subMonths(now, months);
}

export interface DateBucket {
  label: string;
  start: Date;
  end: Date;
}

export function generateBuckets(window: TimeWindow): DateBucket[] {
  const now = new Date();
  const buckets: DateBucket[] = [];

  if (window === '12M') {
    // Bi-weekly buckets for 12M (~26 buckets, manageable API call count)
    let cursor = startOfWeek(subMonths(now, 12), { weekStartsOn: 1 });
    while (isBefore(cursor, now)) {
      const start = cursor;
      const end = addDays(cursor, 13); // 14-day span
      buckets.push({ label: format(start, 'MMM d'), start, end });
      cursor = addDays(cursor, 14);
    }
  } else {
    // Weekly buckets for 3M (~13 buckets) and 6M (~26 buckets)
    const months = window === '3M' ? 3 : 6;
    let cursor = startOfWeek(subMonths(now, months), { weekStartsOn: 1 });
    while (isBefore(cursor, now)) {
      const start = cursor;
      const end = endOfWeek(cursor, { weekStartsOn: 1 });
      buckets.push({ label: format(start, 'MMM d'), start, end });
      cursor = addWeeks(cursor, 1);
    }
  }

  return buckets;
}

export function bucketVulns(
  dates: Date[],
  buckets: DateBucket[]
): number[] {
  return buckets.map(({ start, end }) =>
    dates.filter((d) => !isBefore(d, start) && !isAfter(d, end)).length
  );
}

export function mergeTrendPoints(
  buckets: DateBucket[],
  kevCounts: number[],
  nvdCounts: number[],
  osvCounts: number[]
): TrendPoint[] {
  return buckets.map((b, i) => ({
    label: b.label,
    date: b.start,
    kev: kevCounts[i] ?? 0,
    nvd: nvdCounts[i] ?? 0,
    osv: osvCounts[i] ?? 0,
  }));
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH':     return '#f97316';
    case 'MEDIUM':   return '#eab308';
    case 'LOW':      return '#22c55e';
    default:         return '#6b7280';
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Returns true if the bucket [start, end] overlaps the holiday slow-down window (Dec 24 – Jan 3).
function bucketOverlapsHoliday(start: Date, end: Date): boolean {
  for (const year of [start.getFullYear(), end.getFullYear()]) {
    const hStart = new Date(year, 11, 24); // Dec 24
    const hEnd = new Date(year + 1, 0, 3); // Jan 3 next year
    if (start <= hEnd && end >= hStart) return true;
  }
  return false;
}

/** Groups consecutive holiday buckets into annotation spans for the trend chart. */
export function getHolidayAnnotations(buckets: DateBucket[]): ChartAnnotation[] {
  const annotations: ChartAnnotation[] = [];
  let x1: string | null = null;
  let x2: string | null = null;

  for (const bucket of buckets) {
    if (bucketOverlapsHoliday(bucket.start, bucket.end)) {
      if (!x1) x1 = bucket.label;
      x2 = bucket.label;
    } else if (x1 && x2) {
      annotations.push({ x1, x2, description: 'Holiday period (Dec 24 – Jan 3): NVD and CISA publish fewer advisories during this window.' });
      x1 = null;
      x2 = null;
    }
  }
  if (x1 && x2) {
    annotations.push({ x1, x2, description: 'Holiday period (Dec 24 – Jan 3): NVD and CISA publish fewer advisories during this window.' });
  }
  return annotations;
}
