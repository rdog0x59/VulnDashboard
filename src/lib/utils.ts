import {
  subMonths,
  startOfMonth,
  endOfMonth,
  addMonths,
  format,
  isAfter,
  isBefore,
} from 'date-fns';
import type { Severity, TimeWindow, TrendPoint } from '../types';

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
  // All windows use monthly buckets
  const months = window === '3M' ? 3 : window === '6M' ? 6 : 12;
  let cursor = startOfMonth(subMonths(now, months));
  while (isBefore(cursor, now)) {
    const start = cursor;
    const end = endOfMonth(cursor);
    buckets.push({ label: format(start, 'MMM yy'), start, end });
    cursor = addMonths(cursor, 1);
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
