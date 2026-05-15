import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Flame, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Vulnerability, Source, Severity } from '../types';
import { SourceBadge } from './SourceBadge';
import { SeverityBadge } from './SeverityBadge';
import { VulnDetail } from './VulnDetail';

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
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorOpen, setVendorOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('publishedDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Vulnerability | null>(null);
  const PAGE_SIZE = 25;

  const vendors = useMemo(() => {
    const set = new Set<string>();
    for (const v of vulns) if (v.vendor) set.add(v.vendor);
    return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [vulns]);

  const filteredVendors = useMemo(() =>
    vendors.filter((v) =>
      v === 'ALL' || v.toLowerCase().includes(vendorSearch.toLowerCase())
    ),
  [vendors, vendorSearch]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vulns
      .filter((v) => {
        if (sourceFilter !== 'ALL' && v.source !== sourceFilter) return false;
        if (severityFilter !== 'ALL' && v.severity !== severityFilter) return false;
        if (vendorFilter !== 'ALL' && v.vendor !== vendorFilter) return false;
        if (q && !v.id.toLowerCase().includes(q) && !v.title.toLowerCase().includes(q) &&
            !(v.vendor ?? '').toLowerCase().includes(q) &&
            !(v.product ?? '').toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'publishedDate') {
          cmp = new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
        } else if (sortKey === 'severity') {
          cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        } else if (sortKey === 'source') {
          cmp = a.source.localeCompare(b.source);
        } else {
          cmp = a.id.localeCompare(b.id);
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [vulns, search, sourceFilter, severityFilter, vendorFilter, sortKey, sortDir]);

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

  function resetFilters() {
    setSearch(''); setSourceFilter('ALL'); setSeverityFilter('ALL');
    setVendorFilter('ALL'); setVendorSearch(''); setPage(0);
  }

  const hasActiveFilters = search || sourceFilter !== 'ALL' || severityFilter !== 'ALL' || vendorFilter !== 'ALL';

  const SOURCES: (Source | 'ALL')[] = ['ALL', 'KEV', 'NVD', 'OSV'];
  const SEVERITIES: (Severity | 'ALL')[] = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <>
      <div className="rounded-xl border border-navy-600 bg-navy-900 overflow-hidden">

        {/* Filter row 1: search + source + severity */}
        <div className="p-4 border-b border-navy-700 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search CVE ID, title, vendor or product…"
                className="w-full pl-9 pr-4 py-2 bg-navy-800 border border-navy-600 rounded-lg
                  text-sm text-slate-200 placeholder-slate-600 focus:outline-none
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {/* Source filter */}
              <div className="flex rounded-lg overflow-hidden border border-navy-600">
                {SOURCES.map((s) => (
                  <button key={s} onClick={() => { setSourceFilter(s); setPage(0); }}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sourceFilter === s ? 'bg-blue-600 text-white' : 'bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-700'
                    }`}
                  >{s}</button>
                ))}
              </div>
              {/* Severity filter */}
              <div className="flex rounded-lg overflow-hidden border border-navy-600">
                {SEVERITIES.map((s) => (
                  <button key={s} onClick={() => { setSeverityFilter(s); setPage(0); }}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      severityFilter === s ? 'bg-blue-600 text-white' : 'bg-navy-800 text-slate-400 hover:text-white hover:bg-navy-700'
                    }`}
                  >{s === 'ALL' ? 'ALL' : s.slice(0, 4)}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter row 2: vendor + active-filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Vendor dropdown */}
            <div className="relative">
              <button
                onClick={() => setVendorOpen((o) => !o)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  vendorFilter !== 'ALL'
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                    : 'bg-navy-800 border-navy-600 text-slate-400 hover:text-white hover:bg-navy-700'
                }`}
              >
                <span>Vendor{vendorFilter !== 'ALL' ? `: ${vendorFilter}` : ''}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {vendorOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-navy-800 border border-navy-600 rounded-lg shadow-xl z-20 overflow-hidden">
                  <div className="p-2 border-b border-navy-700">
                    <input
                      autoFocus
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      placeholder="Search vendors…"
                      className="w-full px-2.5 py-1.5 bg-navy-700 border border-navy-600 rounded text-xs
                        text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredVendors.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-500">No vendors found</p>
                    ) : filteredVendors.map((v) => (
                      <button
                        key={v}
                        onClick={() => { setVendorFilter(v); setVendorSearch(''); setVendorOpen(false); setPage(0); }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          vendorFilter === v
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-navy-700'
                        }`}
                      >
                        {v === 'ALL' ? 'All vendors' : v}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active filter chips */}
            {vendorFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs">
                {vendorFilter}
                <button onClick={() => setVendorFilter('ALL')} className="hover:text-white ml-0.5">×</button>
              </span>
            )}
            {severityFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs">
                {severityFilter}
                <button onClick={() => setSeverityFilter('ALL')} className="hover:text-white ml-0.5">×</button>
              </span>
            )}
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-300 transition-colors ml-1">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" onClick={() => setVendorOpen(false)}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-700">
                {([
                  ['id', 'CVE ID'],
                  ['source', 'Source'],
                  ['severity', 'Severity'],
                  ['publishedDate', 'Published'],
                ] as [SortKey, string][]).map(([k, label]) => (
                  <th key={k} onClick={() => handleSort(k)}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none"
                  >
                    <span className="flex items-center gap-1">{label}<SortIcon k={k} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 w-8" />
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
                    onClick={() => setSelected(v)}
                    className="border-b border-navy-800 hover:bg-navy-800/60 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {v.ransomwareUse && (
                          <span title="Used in ransomware campaigns">
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
                        {format(new Date(v.publishedDate), 'yyyy-MM-dd')}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <p className="text-xs text-slate-400 line-clamp-2">{v.description || v.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
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
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded text-xs bg-navy-800 border border-navy-700 text-slate-400
                  hover:text-white hover:border-navy-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >Prev</button>
              <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded text-xs bg-navy-800 border border-navy-700 text-slate-400
                  hover:text-white hover:border-navy-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      <VulnDetail vuln={selected} onClose={() => setSelected(null)} />
    </>
  );
}
