import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TrendChart } from './components/TrendChart';
import { VulnTable } from './components/VulnTable';
import { OsvSearch } from './components/OsvSearch';
import { TimeWindowSelector } from './components/TimeWindowSelector';
import { useKEV } from './hooks/useKEV';
import { useNVDTrend, useNVDCatalog } from './hooks/useNVD';
import { generateBuckets, mergeTrendPoints } from './lib/utils';
import type { TimeWindow } from './types';

export default function App() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('3M');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const queryClient = useQueryClient();

  const kevQuery = useKEV(timeWindow);
  const nvdTrendQuery = useNVDTrend(timeWindow);
  const nvdCatalogQuery = useNVDCatalog(timeWindow);

  const isRefreshing =
    kevQuery.isFetching || nvdTrendQuery.isFetching || nvdCatalogQuery.isFetching;

  function handleRefresh() {
    queryClient.invalidateQueries();
    setLastUpdated(new Date());
  }

  const trendData = useMemo(() => {
    const buckets = generateBuckets(timeWindow);
    const kevCounts = kevQuery.data?.counts ?? Array(buckets.length).fill(0);
    const nvdCounts = nvdTrendQuery.data ?? Array(buckets.length).fill(0);
    const osvCounts = Array(buckets.length).fill(0);
    return mergeTrendPoints(buckets, kevCounts, nvdCounts, osvCounts);
  }, [timeWindow, kevQuery.data, nvdTrendQuery.data]);

  const allVulns = useMemo(() => {
    const kev = kevQuery.data?.filtered ?? [];
    const nvd = nvdCatalogQuery.data ?? [];
    return [...kev, ...nvd].sort(
      (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
  }, [kevQuery.data, nvdCatalogQuery.data]);

  const isLoadingCatalog = kevQuery.isLoading || nvdCatalogQuery.isLoading;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Overview</h2>
            <p className="text-slate-500 text-xs">
              Showing data from CISA KEV &amp; NVD for the selected window
            </p>
          </div>
          <TimeWindowSelector value={timeWindow} onChange={setTimeWindow} />
        </div>

        <StatCards vulns={allVulns} isLoading={isLoadingCatalog} />

        <TrendChart
          data={trendData}
          isLoadingKEV={kevQuery.isLoading || kevQuery.isFetching}
          isLoadingNVD={nvdTrendQuery.isLoading || nvdTrendQuery.isFetching}
          hasOSV={false}
          errorKEV={kevQuery.error ? String(kevQuery.error) : undefined}
          errorNVD={nvdTrendQuery.error ? String(nvdTrendQuery.error) : undefined}
        />

        <div className="flex flex-wrap gap-3">
          {[
            { label: 'CISA KEV', desc: 'Known Exploited Vulnerabilities catalog — actively weaponised CVEs', color: '#f59e0b' },
            { label: 'NVD', desc: 'NIST National Vulnerability Database — all published CVEs with CVSS scores', color: '#3b82f6' },
            { label: 'OSV', desc: 'Open Source Vulnerabilities — search below by package name', color: '#10b981' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-start gap-2 px-3 py-2 rounded-lg bg-navy-900 border border-navy-700 max-w-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: s.color }} />
              <div>
                <span className="text-xs font-medium text-slate-200">{s.label}</span>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Vulnerability Catalog</h2>
          <VulnTable vulns={allVulns} isLoading={isLoadingCatalog} />
        </div>

        <OsvSearch />
      </main>

      <footer className="border-t border-navy-800 mt-12 py-4">
        <p className="text-center text-xs text-slate-600">
          Data sourced from{' '}
          <a href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">CISA KEV</a>,{' '}
          <a href="https://nvd.nist.gov/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">NIST NVD</a>, and{' '}
          <a href="https://osv.dev" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">OSV</a>.
          {' '}For security research and situational awareness only.
        </p>
      </footer>
    </div>
  );
}
