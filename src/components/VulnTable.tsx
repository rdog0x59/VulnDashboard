import { useState, useMemo } from 'react';
import { Search, ExternalLink, ChevronUp, ChevronDown, Flame } from 'lucide-react';
import { format } from 'date-fns';
import type { Vulnerability, Source, Severity } from '../types';
import { SourceBadge } from './SourceBadge';
import { SeverityBadge } from './SeverityBadge';

type SortKey = 'publishedDate' | 'severity' | 'source' | 'id';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<Severity, number> = {
  CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0,
};

interface Props {
  vulns: Vulnerability[];
  isLoading: boolean;
}

export function VulnTable({ vulns, isLoading }: Props) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<Source | 'ALL'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('publishedDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vulns
      .filter((v) => {
        if (sourceFilter !== 'ALL' && v.source !== sourceFilter) return false;
        if (severityFilter !== 'ALL' && v.severity !== severityFilter) return false;
        if (q && !v.id.toLowerCase().includes(q) && !v.title.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'publishedDate') {
          cmp = a.publishedDate.getTime() - b.publishedDate.getTime();
        } else if (sortKey === 'severity') {
          cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        } else if (sortKey === 'source') {
          cmp = a.source.localeCompare(b.source);
        } else {
          cmp = a.id.localeCompare(b.id);
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [vulns, search, sourceFilter, severityFilter, sortKey, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-blue-400" />
      : <ChevronDown className="w-3 h-3 text-blue-400" />;
  }

  const SOURCES: (Source | 'ALL')[] = ['ALL', 'KEV', 'NVD', 'OSV'];
  const SEVERITIES: (Severity | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="rounded-xl border border-navy-600 bg-navy-900 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-navy-700 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search CVE ID or title…"
            className="w-full pl-9 pr-4 py-2 bg-navy-800 border border-navy-600 rounded-lg
              text-sm text-slate-200 placeholder-slate-600 focus:outline-none
              focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-lg overflow-hidden border border-navy-600">
            {SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => { setSourceFilter(s); setPage(0); }}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  sourceFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-navy-600">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => { setSeverityFilter(s); setPage(0); }}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  severityFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-700'
                }`}
              >
                {s === 'ALL' ? 'ALL' : s.slice(0, 4)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700">
              {([
                ['id', 'CVE ID'],
                ['source', 'Source'],
                ['severity', 'Severity'],
                ['publishedDate', 'Published'],
              ] as [SortKey, string][]).map(([k, label]) => (
                <th
                  key={k}
                  onClick={() => handleSort(k)}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon k={k} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && paginated.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-navy-800">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-navy-700 rounded animate-pulse" style={{ width: `${60 + (j * 13) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No vulnerabilities match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((v) => (
                <tr
                  key={`${v.source}-${v.id}`}
                  className="border-b border-navy-800 hover:bg-navy-800/50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {v.ransomwareUse && (
                        <span title="Ransomware campaigns">
                          <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        </span>
                      )}
                      <span className="font-mono text-xs text-slate-200">{v.id}</span>
                    </div>
                    {v.vendor && v.product && (
                      <span className="text-xs text-slate-600 mt-0.5 block">
                        {v.vendor} · {v.product}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SourceBadge source={v.source} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SeverityBadge severity={v.severity} score={v.cvssScore} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-slate-400 font-mono">
                      {format(v.publishedDate, 'yyyy-MM-dd')}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-sm">
                    <p className="text-xs text-slate-400 line-clamp-2">{v.description || v.title}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {v.url && (
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-navy-700 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {filtered.length.toLocaleString()} results · page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded text-xs bg-navy-800 border border-navy-700 text-slate-400
                hover:text-white hover:border-navy-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded text-xs bg-navy-800 border border-navy-700 text-slate-400
                hover:text-white hover:border-navy-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
